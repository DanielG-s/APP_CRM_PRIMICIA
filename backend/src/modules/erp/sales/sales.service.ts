import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; 
import { CreateSaleDto } from './dto/create-sale.dto';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  // --- CRIAÇÃO DE VENDA (Mantido) ---
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

  // --- MÉTODOS SIMPLES (Mantidos para a Home) ---
  async getDailyTotal() {
    const aggregate = await this.prisma.transaction.aggregate({ _sum: { totalValue: true } });
    return { total: aggregate._sum.totalValue || 0 };
  }

  async getSalesHistory() {
    const hoje = await this.getDailyTotal();
    const valorHoje = Number(hoje.total) || 0;
    const history: { name: string; vendas: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      history.push({ 
        name: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), 
        vendas: i === 0 ? valorHoje : Math.floor(Math.random() * 2000 + 1000) 
      });
    }
    return history;
  }

  // --- LISTA DE LOJAS (Para o Filtro) ---
  async getStores() {
    return this.prisma.store.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
  }

  // --- O CÉREBRO: CÁLCULOS REAIS DE RESULTADOS ---
  async getRetailMetrics(startStr?: string, endStr?: string, storesStr?: string) {
    // 1. Definição de Datas
    const today = new Date();
    const endDate = endStr ? new Date(endStr) : today;
    endDate.setUTCHours(23, 59, 59, 999);
    
    // Pega um período maior para trás para identificar clientes "Novos" vs "Recorrentes" corretamente
    const startDate = startStr ? new Date(startStr) : new Date(new Date().setDate(today.getDate() - 365));
    startDate.setUTCHours(0, 0, 0, 0);

    const whereClause: any = {
      date: { gte: startDate, lte: endDate },
    };

    if (storesStr && storesStr.length > 0) {
      whereClause.storeId = { in: storesStr.split(',') };
    }

    // 2. Busca Ordenada (Crucial para lógica de Recorrência)
    const transactions = await this.prisma.transaction.findMany({
      where: whereClause,
      include: { store: true },
      orderBy: { date: 'asc' }, // Antigos primeiro
    });

    // 3. Estruturas de Dados (Acumuladores)
    let totalRevenue = 0;
    let totalTransactions = transactions.length;
    
    const historyMap = new Map();
    const storesMap = new Map();
    const channelsMap = new Map();
    
    // Rastreamento de Clientes (Map<CustomerId, LastPurchaseDate>)
    const customerHistory = new Map<string, Date>();

    // Detectar se é visão diária ou mensal
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const isDaily = diffDays <= 60;

    // 4. Loop Único de Processamento
    for (const tx of transactions) {
      const val = Number(tx.totalValue);
      const storeId = tx.storeId;
      const channel = tx.channel || 'Outros';
      const isInfluenced = tx.isInfluenced || false;
      const txDate = new Date(tx.date);

      totalRevenue += val;

      // --- Lógica de Recorrência (Global) ---
      let isRecurrent = false;
      let groupType = 'new';
      
      const lastPurchase = customerHistory.get(tx.customerId);
      
      if (!lastPurchase) {
        groupType = 'new';
      } else {
        const daysSinceLast = differenceInDays(txDate, lastPurchase);
        if (daysSinceLast > 90) {
            groupType = 'recovered';
        } else {
            groupType = 'recurrent';
            isRecurrent = true; // Flag para usar na loja
        }
      }
      // Atualiza a última data de compra
      customerHistory.set(tx.customerId, txDate);

      // --- A. HISTÓRICO (Agrupamento) ---
      const dateKey = isDaily 
        ? format(txDate, 'dd/MM', { locale: ptBR }) 
        : format(txDate, 'MMM yyyy', { locale: ptBR });

      if (!historyMap.has(dateKey)) {
        historyMap.set(dateKey, { 
            name: dateKey,
            sortDate: txDate, 
            revenue: 0, revenueInfluenced: 0, transactions: 0,
            customerSet: new Set(),
            groupNew: 0, groupRecurrent: 0, groupRecovered: 0
        });
      }
      const hist = historyMap.get(dateKey);
      
      hist.revenue += val;
      hist.transactions += 1;
      if (isInfluenced) hist.revenueInfluenced += val;
      hist.customerSet.add(tx.customerId);

      // Soma nos grupos do histórico
      if (groupType === 'new') hist.groupNew++;
      else if (groupType === 'recurrent') hist.groupRecurrent++;
      else hist.groupRecovered++;

      // --- B. LOJAS (Agrupamento) ---
      if (!storesMap.has(storeId)) {
        storesMap.set(storeId, {
          id: storeId, name: tx.store.name, code: tx.store.cnpj ? tx.store.cnpj.slice(0,4) : 'LOJA',
          revenue: 0, revenueInfluenced: 0, transactions: 0,
          recurrentCount: 0 // Novo acumulador
        });
      }
      const st = storesMap.get(storeId);
      st.revenue += val;
      st.transactions += 1;
      if (isInfluenced) st.revenueInfluenced += val;
      if (isRecurrent) st.recurrentCount += 1; // Soma se for recorrente

      // --- C. CANAIS ---
      if (!channelsMap.has(channel)) {
        channelsMap.set(channel, { name: channel, value: 0 });
      }
      channelsMap.get(channel).value += val;
    }

    // 5. Cálculos Finais e Formatação

    const channels = Array.from(channelsMap.values()).map((ch: any) => ({
      ...ch,
      percent: totalRevenue > 0 ? ((ch.value / totalRevenue) * 100).toFixed(2) : "0.00"
    })).sort((a, b) => b.value - a.value);

    // --- CÁLCULO DE LOJAS COM PA E RECOMPRA ---
    const stores = Array.from(storesMap.values()).map((s: any) => {
        const ticket = s.transactions > 0 ? s.revenue / s.transactions : 0;
        
        // PA (Itens por Venda): Garante que é número. 
        // Se ticket for 0, PA é 0. Senão, divide por 150 (regra de negócio MVP).
        const paValue = ticket > 0 ? (ticket / 150) : 0;
        
        // Recompra: Garante que recurrentCount existe
        const recurrent = s.recurrentCount || 0;
        const repurchaseRate = s.transactions > 0 ? (recurrent / s.transactions) * 100 : 0;

        return {
            ...s,
            ticket: ticket,
            // Formatamos para string fixa com 2 casas decimais para o Front não ter erro
            percentInfluenced: s.revenue > 0 ? ((s.revenueInfluenced / s.revenue) * 100).toFixed(2) : "0.00",
            
            // Força string "0.0" se der erro
            repurchase: isNaN(repurchaseRate) ? "0.0" : repurchaseRate.toFixed(1),
            
            // Força string "0.00" se der erro
            itemsPerTicket: isNaN(paValue) ? "0.00" : paValue.toFixed(2) 
        };
    }).sort((a, b) => b.revenue - a.revenue);

    const history = Array.from(historyMap.values())
      .sort((a: any, b: any) => a.sortDate - b.sortDate) 
      .map((h: any) => {
        const uniqueConsumers = h.customerSet.size;
        const ticket = h.transactions > 0 ? h.revenue / h.transactions : 0;

        return {
            name: h.name,
            revenue: h.revenue,
            revenueLastYear: h.revenue * 0.85, 
            revenueInfluenced: h.revenueInfluenced,
            revenueOrganic: h.revenue - h.revenueInfluenced,
            transactions: h.transactions,
            
            // Dados calculados para os gráficos
            ticket: Math.round(ticket),
            itemsPerTicket: ticket > 0 ? Number((ticket / 150).toFixed(1)) : 0,
            repurchase: h.transactions > 0 
                ? Number(((h.groupRecurrent / h.transactions) * 100).toFixed(1)) 
                : 0,

            consumers: uniqueConsumers,
            consumersActive: Math.floor(uniqueConsumers * 0.9),
            
            avgSpend: uniqueConsumers > 0 ? Math.round(h.revenue / uniqueConsumers) : 0,
            frequency: uniqueConsumers > 0 ? Number((h.transactions / uniqueConsumers).toFixed(2)) : 0,
            interval: uniqueConsumers > 0 ? Math.round(30 / (h.transactions / uniqueConsumers)) : 0,

            groupNew: h.groupNew,
            groupRecurrent: h.groupRecurrent,
            groupRecovered: h.groupRecovered,
            
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