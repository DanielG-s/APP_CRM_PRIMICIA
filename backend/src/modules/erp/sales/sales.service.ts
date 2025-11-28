import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async processSale(data: CreateSaleDto) {
    const customer = await this.prisma.customer.upsert({
      where: { email: data.customerEmail },
      update: { name: data.customerName, phone: '11999999999' },
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
      },
    });

    return { message: 'Venda processada e salva!', transactionId: transaction.id, customer: customer.name };
  }

  async getDailyTotal() {
    const aggregate = await this.prisma.transaction.aggregate({
      _sum: { totalValue: true },
    });
    return { total: aggregate._sum.totalValue || 0 };
  }

  async getSalesHistory() {
    const hoje = await this.getDailyTotal();
    const valorHoje = Number(hoje.total) || 0;
    const history: { name: string; vendas: number }[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dataFormatada = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      let valor = i === 0 ? valorHoje : Math.floor(Math.random() * (3000 - 1000 + 1) + 1000);
      history.push({ name: dataFormatada, vendas: valor });
    }
    return history;
  }

  // --- AQUI ESTÁ A CORREÇÃO ---
  async getRetailMetrics(startStr?: string, endStr?: string, storesStr?: string) {

    // Lógica de Simulação de Filtro de Loja
    // Se vierem lojas filtradas, vamos simular que os valores são menores (ex: 1 loja = 10% do total)
    let storeFactor = 1.0;
    if (storesStr && storesStr.length > 0) {
        const storeCount = storesStr.split(',').length;
        // Simulação: Cada loja representa aprox 4% do faturamento total da rede
        storeFactor = Math.min(1, storeCount * 0.04); 
    }

    // 1. Define Datas (Padrão: Últimos 12 meses se não vier nada)
    const end = endStr ? new Date(endStr) : new Date();
    const start = startStr ? new Date(startStr) : new Date(new Date().setFullYear(end.getFullYear() - 1));

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const isDaily = diffDays <= 60; 
    const points = isDaily ? diffDays : 13;

    const history: any[] = [];
    let totalRevenuePeriod = 0;
    let totalTransactionsPeriod = 0;

    for (let i = 0; i <= points; i++) {
      const datePoint = new Date(start);
      if (isDaily) {
        datePoint.setDate(start.getDate() + i);
      } else {
        datePoint.setMonth(start.getMonth() + i);
      }

      const name = isDaily 
        ? datePoint.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
        : datePoint.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });

      const baseRevenue = (Math.floor(Math.random() * (isDaily ? 10000 : 250000)) + (isDaily ? 5000 : 150000)) * storeFactor;
      const influenced = Math.floor(baseRevenue * (0.25 + Math.random() * 0.15));
      const transactions = Math.floor(baseRevenue / 450);

      totalRevenuePeriod += baseRevenue;
      totalTransactionsPeriod += transactions;

      history.push({
        name: name,
        revenue: baseRevenue,
        revenueLastYear: Math.floor(baseRevenue * 0.9),
        revenueInfluenced: influenced,
        revenueOrganic: baseRevenue - influenced,
        transactions: transactions,
        ticket: Math.floor(baseRevenue / transactions),
        itemsPerTicket: Number((1.8 + Math.random()).toFixed(2)),
        repurchase: Math.floor(40 + Math.random() * 20),
        avgSpend: Math.floor(450 + Math.random() * 50),
        interval: Math.floor(45 + Math.random() * 15),
        frequency: Number((1.1 + Math.random() * 0.4).toFixed(2)),
        groupNew: Math.floor(transactions * 0.2),
        groupRecurrent: Math.floor(transactions * 0.7),
        groupRecovered: Math.floor(transactions * 0.1),
        revenueNew: Math.floor(baseRevenue * 0.15),
        revenueRecurrent: Math.floor(baseRevenue * 0.75),
        revenueRecovered: Math.floor(baseRevenue * 0.10),
        consumers: 30000 + (i * 100),
        consumersActive: 25000 + (i * 80)
      });
    }

    const channels = [
      { name: 'Agenda', value: totalRevenuePeriod * 0.45, percent: 72.22 },
      { name: 'Agenda + SMS', value: totalRevenuePeriod * 0.10, percent: 10.59 },
      { name: 'SMS', value: totalRevenuePeriod * 0.07, percent: 7.05 },
      { name: 'E-mail', value: totalRevenuePeriod * 0.05, percent: 5.32 },
      { name: 'Agenda + E-mail', value: totalRevenuePeriod * 0.03, percent: 3.63 },
      { name: 'WhatsApp', value: totalRevenuePeriod * 0.02, percent: 1.5 },
    ];

    return {
      kpis: {
        revenue: totalRevenuePeriod,
        transactions: totalTransactionsPeriod,
        ticketAverage: totalTransactionsPeriod > 0 ? totalRevenuePeriod / totalTransactionsPeriod : 0,
        repurchaseRate: 54.01,
        avgSpend: 450, interval: 52, frequency: 1.32
      },
      history,
      channels
    };
  }
}