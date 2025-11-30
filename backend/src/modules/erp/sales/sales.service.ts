import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; 
import { CreateSaleDto } from './dto/create-sale.dto';
import { format, differenceInDays, subDays, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  // --- 1. INGESTÃO DE DADOS (WEBHOOK) ---
  async processSale(data: CreateSaleDto) {
    const customer = await this.prisma.customer.upsert({
      where: { email: data.customerEmail },
      update: { name: data.customerName },
      create: {
        name: data.customerName,
        email: data.customerEmail,
        cpf: data.customerCpf,
        storeId: data.storeId,
      },
    });

    const transaction = await this.prisma.transaction.create({
      data: {
        storeId: data.storeId,
        customerId: customer.id,
        totalValue: data.totalValue,
        date: new Date(),
        items: data.items as any,
        channel: data.channel || 'Loja Física',
        isInfluenced: data.isInfluenced || false,
      },
    });

    return { message: 'Venda processada!', transactionId: transaction.id };
  }

  // --- 2. DADOS DA HOME (VISÃO GERAL) ---
  
  async getDailyTotal() {
    const today = new Date();
    const start = startOfDay(today);
    const end = endOfDay(today);

    const aggregate = await this.prisma.transaction.aggregate({
      _sum: { totalValue: true },
      _count: { id: true },
      where: {
        date: { gte: start, lte: end }
      }
    });

    return { 
        total: Number(aggregate._sum.totalValue) || 0,
        count: aggregate._count.id || 0
    };
  }

  async getSalesHistory() {
    const endDate = new Date();
    const startDate = subDays(endDate, 6); // Últimos 7 dias
    startDate.setHours(0,0,0,0);

    const transactions = await this.prisma.transaction.findMany({
        where: {
            date: { gte: startDate, lte: endDate }
        },
        orderBy: { date: 'asc' }
    });

    const historyMap = new Map();
    
    // Inicializa dias zerados
    for(let i=0; i<=6; i++) {
        const d = subDays(endDate, 6-i);
        const key = format(d, 'dd/MM', { locale: ptBR });
        historyMap.set(key, { name: key, vendas: 0, total: 0 });
    }

    transactions.forEach(tx => {
        const key = format(tx.date, 'dd/MM', { locale: ptBR });
        if(historyMap.has(key)) {
            const current = historyMap.get(key);
            current.vendas += Number(tx.totalValue);
            current.total += 1;
        }
    });

    return Array.from(historyMap.values());
  }

  // AQUI ESTÁ A FUNÇÃO QUE FALTAVA
  async getRecentSales() {
    const sales = await this.prisma.transaction.findMany({
        take: 5,
        orderBy: { date: 'desc' },
        include: { 
            customer: { select: { name: true, email: true } },
            store: { select: { name: true } }
        }
    });

    return sales.map(s => ({
        id: s.id,
        customer: s.customer?.name || 'Consumidor Final',
        email: s.customer?.email,
        store: s.store?.name,
        value: Number(s.totalValue),
        date: s.date,
        channel: s.channel
    }));
  }

  async getStores() {
    return this.prisma.store.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
  }

  // --- 3. DADOS DE ANALYTICS (PÁGINA DE RESULTADOS) ---
  async getRetailMetrics(startStr?: string, endStr?: string, storesStr?: string) {
    // Datas
    const today = new Date();
    const endDate = endStr ? new Date(endStr) : today;
    endDate.setUTCHours(23, 59, 59, 999);
    const startDate = startStr ? new Date(startStr) : new Date(new Date().setDate(today.getDate() - 365));
    startDate.setUTCHours(0, 0, 0, 0);

    const whereClause: any = { date: { gte: startDate, lte: endDate } };
    if (storesStr && storesStr.length > 0) whereClause.storeId = { in: storesStr.split(',') };

    const transactions = await this.prisma.transaction.findMany({
      where: whereClause,
      include: { store: true },
      orderBy: { date: 'asc' },
    });

    let totalRevenue = 0;
    let totalTransactions = transactions.length;
    
    const historyMap = new Map();
    const storesMap = new Map();
    const channelsMap = new Map();
    const customerHistory = new Map<string, Date>();

    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const isDaily = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) <= 60;

    for (const tx of transactions) {
      const val = Number(tx.totalValue);
      const storeId = tx.storeId;
      const channel = tx.channel || 'Outros';
      const isInfluenced = tx.isInfluenced || false;
      const txDate = new Date(tx.date);

      totalRevenue += val;

      // Recorrência
      let isRecurrent = false;
      let groupType = 'new';
      const lastPurchase = customerHistory.get(tx.customerId);
      
      if (!lastPurchase) groupType = 'new';
      else {
        const daysSinceLast = differenceInDays(txDate, lastPurchase);
        if (daysSinceLast > 90) groupType = 'recovered';
        else {
            groupType = 'recurrent';
            isRecurrent = true;
        }
      }
      customerHistory.set(tx.customerId, txDate);

      // Histórico
      const dateKey = isDaily 
        ? format(txDate, 'dd/MM', { locale: ptBR }) 
        : format(txDate, 'MMM yyyy', { locale: ptBR });

      if (!historyMap.has(dateKey)) {
        historyMap.set(dateKey, { 
            name: dateKey, sortDate: txDate, revenue: 0, revenueInfluenced: 0, transactions: 0,
            customerSet: new Set(), groupNew: 0, groupRecurrent: 0, groupRecovered: 0
        });
      }
      const hist = historyMap.get(dateKey);
      hist.revenue += val;
      hist.transactions += 1;
      if (isInfluenced) hist.revenueInfluenced += val;
      hist.customerSet.add(tx.customerId);
      
      if (groupType === 'new') hist.groupNew++;
      else if (groupType === 'recurrent') hist.groupRecurrent++;
      else hist.groupRecovered++;

      // Lojas
      if (!storesMap.has(storeId)) {
        storesMap.set(storeId, {
          id: storeId, name: tx.store.name, code: tx.store.cnpj ? tx.store.cnpj.slice(0,4) : 'LOJA',
          revenue: 0, revenueInfluenced: 0, transactions: 0, recurrentCount: 0 
        });
      }
      const st = storesMap.get(storeId);
      st.revenue += val;
      st.transactions += 1;
      if (isInfluenced) st.revenueInfluenced += val;
      if (isRecurrent) st.recurrentCount += 1;

      // Canais
      if (!channelsMap.has(channel)) channelsMap.set(channel, { name: channel, value: 0 });
      channelsMap.get(channel).value += val;
    }

    const channels = Array.from(channelsMap.values()).map((ch: any) => ({
      ...ch, percent: totalRevenue > 0 ? ((ch.value / totalRevenue) * 100).toFixed(2) : "0.00"
    })).sort((a, b) => b.value - a.value);

    const stores = Array.from(storesMap.values()).map((s: any) => {
        const ticket = s.transactions > 0 ? s.revenue / s.transactions : 0;
        return {
            ...s,
            ticket: ticket,
            percentInfluenced: s.revenue > 0 ? ((s.revenueInfluenced / s.revenue) * 100).toFixed(2) : "0.00",
            repurchase: s.transactions > 0 ? ((s.recurrentCount / s.transactions) * 100).toFixed(1) : "0.0",
            itemsPerTicket: ticket > 0 ? (ticket / 150).toFixed(2) : "0.00"
        };
    }).sort((a, b) => b.revenue - a.revenue);

    const history = Array.from(historyMap.values()).sort((a: any, b: any) => a.sortDate - b.sortDate).map((h: any) => {
        const uniqueConsumers = h.customerSet.size;
        const ticket = h.transactions > 0 ? h.revenue / h.transactions : 0;
        return {
            ...h,
            revenueOrganic: h.revenue - h.revenueInfluenced,
            ticket: Math.round(ticket),
            itemsPerTicket: ticket > 0 ? Number((ticket / 150).toFixed(1)) : 0,
            repurchase: h.transactions > 0 ? Number(((h.groupRecurrent / h.transactions) * 100).toFixed(1)) : 0,
            revenueLastYear: h.revenue * 0.85, 
            consumers: uniqueConsumers,
            consumersActive: Math.floor(uniqueConsumers * 0.9),
            avgSpend: uniqueConsumers > 0 ? Math.round(h.revenue / uniqueConsumers) : 0,
            frequency: uniqueConsumers > 0 ? Number((h.transactions / uniqueConsumers).toFixed(2)) : 0,
            interval: uniqueConsumers > 0 ? Math.round(30 / (h.transactions / uniqueConsumers)) : 0,
            revenueNew: Math.round((h.groupNew / h.transactions) * h.revenue) || 0,
            revenueRecurrent: Math.round((h.groupRecurrent / h.transactions) * h.revenue) || 0,
            revenueRecovered: Math.round((h.groupRecovered / h.transactions) * h.revenue) || 0,
        };
    });

    return {
      kpis: {
        revenue: totalRevenue,
        revenueLastYear: totalRevenue * 0.9,
        transactions: totalTransactions,
        ticketAverage: totalTransactions > 0 ? totalRevenue / totalTransactions : 0,
        repurchaseRate: totalTransactions > 0 ? ((totalTransactions - customerHistory.size) / totalTransactions * 100).toFixed(2) : 0,
      },
      history,
      channels,
      stores
    };
  }
}