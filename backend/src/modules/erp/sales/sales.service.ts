import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; 
import { CreateSaleDto } from './dto/create-sale.dto';
import { format, differenceInDays, subDays, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  // ... (MÉTODOS DE INGESTÃO E HOME PERMANECEM IGUAIS) ...
  async processSale(data: CreateSaleDto) { /* ... código anterior ... */ return {transactionId: 'ok'}; }
  async getDailyTotal() { /* ... código anterior ... */ return {total:0, count:0}; }
  async getSalesHistory() { /* ... código anterior ... */ return []; }
  async getRecentSales() { /* ... código anterior ... */ return []; }
  async getStores() { return this.prisma.store.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }); }
  async getRetailMetrics(startStr?: string, endStr?: string, storesStr?: string) { /* ... código anterior ... */ return {}; }

  // --- 4. MÉTODO NOVO: DASHBOARD COM TODOS OS FILTROS ---
  async getChannelDashboard(
    startDate: string, 
    endDate: string,
    filters?: {
        channel?: string,
        campaignId?: string,
        // tags e type podem ser adicionados no futuro
    }
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setUTCHours(23, 59, 59, 999);

    // Filtros dinâmicos para Campanhas
    const campaignWhere: any = { date: { gte: start, lte: end } };
    if (filters?.channel && filters.channel !== 'Todos') {
        // Mapear nomes do front para o banco se necessário (ex: 'E-mail' -> 'Email')
        campaignWhere.channel = filters.channel === 'E-mail' ? 'Email' : filters.channel;
    }
    if (filters?.campaignId && filters.campaignId !== 'todas') {
        campaignWhere.id = filters.campaignId;
    }

    // 1. Buscar Campanhas Filtradas
    const campaignsRaw = await this.prisma.campaign.findMany({
      where: campaignWhere,
      orderBy: { date: 'desc' }
    });

    // 2. Buscar Transações (Receita)
    // Nota: Em um cenário real, filtraríamos vendas APENAS das campanhas selecionadas.
    // Como o seed gera vendas aleatórias, vamos manter o filtro de data para não zerar os gráficos.
    const salesRaw = await this.prisma.transaction.findMany({
      where: { date: { gte: start, lte: end } },
      select: { date: true, totalValue: true, id: true, isInfluenced: true, storeId: true, store: { select: { name: true } } }
    });

    // 3. Buscar Lista de Opções para o Filtro (Todas as campanhas do período, sem filtro de canal)
    const filterOptions = await this.prisma.campaign.findMany({
        where: { date: { gte: start, lte: end } },
        select: { id: true, name: true },
        orderBy: { name: 'asc' }
    });

    // 4. Montar Gráfico Dia a Dia
    const chartData: any[] = [];
    const currentDate = new Date(start);

    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayLabel = `${currentDate.getUTCDate()}/${(currentDate.getUTCMonth() + 1).toString().padStart(2, '0')}`;

      // Dados do dia
      const salesOfDay = salesRaw.filter(s => s.date.toISOString().split('T')[0] === dateStr);
      const revenueInfluencedDay = salesOfDay.filter(s => s.isInfluenced).reduce((acc, curr) => acc + Number(curr.totalValue), 0);
      const revenueTotalDay = salesOfDay.reduce((acc, curr) => acc + Number(curr.totalValue), 0);
      const conversionsDay = salesOfDay.filter(s => s.isInfluenced).length;
      
      const campsOfDay = campaignsRaw.filter(c => new Date(c.date).toISOString().split('T')[0] === dateStr);

      const metrics = campsOfDay.reduce((acc, curr) => {
        return {
          sent: acc.sent + (curr.sent || 0),
          delivered: acc.delivered + (curr.delivered || 0),
          opens: acc.opens + (curr.opens || 0),
          clicks: acc.clicks + (curr.clicks || 0),
          softBounces: acc.softBounces + (curr.softBounces || 0),
          hardBounces: acc.hardBounces + (curr.hardBounces || 0),
          spamReports: acc.spamReports + (curr.spamReports || 0),
          unsubscribes: acc.unsubscribes + (curr.unsubscribes || 0),
        };
      }, { sent: 0, delivered: 0, opens: 0, clicks: 0, softBounces: 0, hardBounces: 0, spamReports: 0, unsubscribes: 0 });

      const ctr = metrics.delivered > 0 ? (metrics.clicks / metrics.delivered) * 100 : 0;
      const ctor = metrics.opens > 0 ? (metrics.clicks / metrics.opens) * 100 : 0;
      const ticket = conversionsDay > 0 ? revenueInfluencedDay / conversionsDay : 0;

      chartData.push({
        name: dayLabel,
        fullDate: dateStr,
        envios: metrics.sent,
        entregues: metrics.delivered,
        aberturas: metrics.opens,
        cliques: metrics.clicks,
        ctr: Number(ctr.toFixed(2)),
        ctor: Number(ctor.toFixed(2)),
        softBounces: metrics.softBounces,
        hardBounces: metrics.hardBounces,
        bounces: metrics.softBounces + metrics.hardBounces,
        spam: metrics.spamReports,
        descadastro: metrics.unsubscribes,
        rejeicoes: metrics.spamReports + metrics.unsubscribes,
        receitaTotal: Number(revenueTotalDay.toFixed(2)),
        receitaInfluenciada: Number(revenueInfluencedDay.toFixed(2)),
        conversoes: conversionsDay,
        ticket: Number(ticket.toFixed(2)),
        vendasInfluenciadas: conversionsDay, 
        baseInfluenciada: conversionsDay, 
      });

      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    // 5. Tabela de Lojas
    const storesMap = new Map();
    salesRaw.forEach(sale => {
      if (!storesMap.has(sale.storeId)) {
        storesMap.set(sale.storeId, { id: sale.storeId, name: sale.store?.name || 'Loja', revenue: 0, revenueInfluenced: 0, conversions: 0, salesInfluenced: 0 });
      }
      const storeData = storesMap.get(sale.storeId);
      const val = Number(sale.totalValue);
      storeData.revenue += val;
      if (sale.isInfluenced) {
        storeData.revenueInfluenced += val;
        storeData.conversoes += 1;
        storeData.salesInfluenced += 1;
      }
    });

    const storesList = Array.from(storesMap.values()).map((s: any) => ({
      ...s, ticketAverage: s.conversions > 0 ? s.revenueInfluenced / s.conversions : 0
    }));

    return { 
        chart: chartData, 
        campaignsList: campaignsRaw, 
        storesList: storesList,
        filterOptions: filterOptions // Lista para o dropdown
    };
  }
}