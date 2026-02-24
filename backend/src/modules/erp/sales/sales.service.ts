import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { Prisma } from '@prisma/client';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) { }

  // --- MÉTODOS BÁSICOS ---
  /**
   * Processes a new sale transaction.
   * Creates or updates the customer record and logs the transaction.
   * @param data DTO containing sale details (customer info, items, total).
   */
  async processSale(data: CreateSaleDto) {
    // Busca a loja para extrair a organização (para manter retrocompatibilidade com webhooks que enviam apenas storeId)
    const store = await this.prisma.store.findUnique({
      where: { id: data.storeId }
    });
    if (!store) throw new Error('Store not found for the given storeId.');
    const orgId = store.organizationId;

    // UPSERT Replacement (Email is not unique anymore)
    let customer = await this.prisma.customer.findFirst({
      where: { email: data.customerEmail },
    });

    if (customer) {
      customer = await this.prisma.customer.update({
        where: { id: customer.id },
        data: {
          name: data.customerName,
          // Do not overwrite other fields like storeId if they exist
        },
      });
    } else {
      customer = await this.prisma.customer.create({
        data: {
          name: data.customerName,
          email: data.customerEmail,
          cpf: data.customerCpf,
          organizationId: orgId,
          storeId: data.storeId,
        },
      });
    }
    const transaction = await this.prisma.transaction.create({
      data: {
        organizationId: orgId,
        storeId: data.storeId,
        customerId: customer.id,
        totalValue: data.totalValue,
        date: new Date(),
        items: data.items,
        channel: data.channel || 'Loja Física',
        isInfluenced: data.isInfluenced || false,
        status: 'PAID', // Garante status pago
      },
    });
    return { message: 'Venda processada!', transactionId: transaction.id };
  }

  /**
   * Calculates the total sales value and count for the current day.
   * Only considers 'PAID' transactions.
   */
  async getDailyTotal() {
    const today = new Date();
    const aggregate = await this.prisma.transaction.aggregate({
      _sum: { totalValue: true },
      _count: { id: true },
      where: {
        date: { gte: startOfDay(today), lte: endOfDay(today) },
        status: 'PAID',
      },
    });
    return {
      total: Number(aggregate._sum.totalValue) || 0,
      count: aggregate._count.id || 0,
    };
  }

  async getSalesHistory() {
    const endDate = new Date();
    const startDate = subDays(endDate, 6);
    startDate.setHours(0, 0, 0, 0);
    const transactions = await this.prisma.transaction.findMany({
      where: { date: { gte: startDate, lte: endDate }, status: 'PAID' },
      orderBy: { date: 'asc' },
    });
    const historyMap = new Map();
    for (let i = 0; i <= 6; i++) {
      const d = subDays(endDate, 6 - i);
      const key = format(d, 'dd/MM', { locale: ptBR });
      historyMap.set(key, { name: key, vendas: 0, total: 0 });
    }
    transactions.forEach((tx) => {
      const key = format(tx.date, 'dd/MM', { locale: ptBR });
      if (historyMap.has(key)) {
        const current = historyMap.get(key);
        current.vendas += Number(tx.totalValue);
        current.total += 1;
      }
    });
    return Array.from(historyMap.values());
  }

  async getRecentSales() {
    const sales = await this.prisma.transaction.findMany({
      take: 5,
      orderBy: { date: 'desc' },
      where: { status: 'PAID' },
      include: {
        customer: { select: { name: true, email: true } },
        store: { select: { name: true } },
      },
    });
    return sales.map((s) => ({
      id: s.id,
      customer: s.customer?.name || 'Consumidor',
      email: s.customer?.email,
      store: s.store?.name,
      value: Number(s.totalValue),
      date: s.date,
      channel: s.channel,
    }));
  }

  async getStores() {
    return (this.prisma.store as any).findMany({
      where: { code: { not: '006' } },
      select: { id: true, name: true, tradeName: true, code: true },
      orderBy: { name: 'asc' },
    });
  }

  // --- FILTROS ---
  async getFilterOptions() {
    const campaigns = await this.prisma.campaign.findMany({
      select: { id: true, name: true, tags: true, type: true, channel: true },
      orderBy: { date: 'desc' },
      take: 2000,
    });

    const tagsSet = new Set<string>();
    campaigns.forEach((c) => c.tags.forEach((t) => tagsSet.add(t)));
    const typesSet = new Set<string>();
    campaigns.forEach((c) => {
      if (c.type) typesSet.add(c.type);
    });

    // 1. Encontrar as lojas pelos códigos
    const store006 = await (this.prisma.store as any).findUnique({
      where: { code: '006' },
    });
    const store007 = await (this.prisma.store as any).findUnique({
      where: { code: '007' },
    });

    const stores = await (this.prisma.store as any).findMany({
      where: { code: { not: '006' } },
      select: { id: true, name: true, tradeName: true, code: true },
    });

    return {
      campaigns: campaigns.map((c) => ({ id: c.id, name: c.name })),
      tags: Array.from(tagsSet).sort(),
      types: Array.from(typesSet).sort(),
      stores: stores.map((s: any) => ({
        id: s.id,
        name: s.name,
        tradeName: s.tradeName,
        code: s.code,
      })),
      channels: ['E-mail', 'SMS', 'Mobile push', 'WhatsApp'],
    };
  }

  // --- LÓGICA DO DASHBOARD DE CANAIS ---
  /**
   * Generates the Channel Dashboard data.
   * enhanced with campaign performance, dispatch stats, and daily metrics.
   *
   * @param startDate Start date string (YYYY-MM-DD).
   * @param endDate End date string (YYYY-MM-DD).
   * @param filters Optional filters for channels, tags, etc.
   */
  async getChannelDashboard(startDate: string, endDate: string, filters?: any) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setUTCHours(23, 59, 59, 999);

    const campaignWhere: Prisma.CampaignWhereInput = {
      date: { gte: start, lte: end },
    };
    if (filters?.channel && filters.channel !== 'Todos') {
      const map: any = { 'Mobile push': 'Push', 'E-mail': 'Email' };
      campaignWhere.channel = map[filters.channel] || filters.channel;
    }
    if (filters?.campaignIds?.length)
      campaignWhere.id = { in: filters.campaignIds };
    if (filters?.tags?.length) campaignWhere.tags = { hasSome: filters.tags };
    if (
      filters?.campaignType?.length &&
      !filters.campaignType.includes('Todos')
    )
      campaignWhere.type = { in: filters.campaignType };

    const campaignsRaw = await this.prisma.campaign.findMany({
      where: campaignWhere,
      orderBy: { date: 'desc' },
      include: { schedules: true },
    });

    const salesRaw = await (this.prisma.transaction as any).findMany({
      where: { date: { gte: start, lte: end }, status: 'PAID' },
      select: {
        date: true,
        totalValue: true,
        id: true,
        isInfluenced: true,
        storeId: true,
        store: { select: { name: true, tradeName: true, code: true } },
      },
    });

    const totalInfluencedRevenue = salesRaw
      .filter((s) => s.isInfluenced)
      .reduce((acc, s) => acc + Number(s.totalValue), 0);
    const totalConversions = salesRaw.filter((s) => s.isInfluenced).length;
    const totalClicks = campaignsRaw.reduce((acc, c) => acc + c.clicks, 0);

    let dispatchesList: any[] = [];

    campaignsRaw.forEach((camp) => {
      const campaignShare = totalClicks > 0 ? camp.clicks / totalClicks : 0;
      const campRevenue = totalInfluencedRevenue * campaignShare;
      const campConversions = Math.floor(totalConversions * campaignShare);

      if (camp.schedules && camp.schedules.length > 0) {
        const share = 1 / camp.schedules.length;
        camp.schedules.forEach((sch) => {
          const dispRev = campRevenue * share;
          const dispConv = campConversions * share;
          dispatchesList.push({
            id: sch.id,
            campaignName: camp.name,
            date: sch.sendDate,
            status: 'Enviado',
            sent: Math.floor(camp.sent * share),
            revenue: dispRev,
            conversions: dispConv,
            ticket: dispConv > 0 ? dispRev / dispConv : 0,
          });
        });
      } else {
        dispatchesList.push({
          id: camp.id + '-main',
          campaignName: camp.name,
          date: camp.date,
          status: camp.status === 'sent' ? 'Concluído' : 'Agendado',
          sent: camp.sent,
          revenue: campRevenue,
          conversions: campConversions,
          ticket: campConversions > 0 ? campRevenue / campConversions : 0,
        });
      }
    });
    dispatchesList = dispatchesList.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    const chartData: any[] = [];
    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayLabel = `${currentDate.getUTCDate()}/${(currentDate.getUTCMonth() + 1).toString().padStart(2, '0')}`;
      const salesOfDay = salesRaw.filter(
        (s) => s.date.toISOString().split('T')[0] === dateStr,
      );
      const campsOfDay = campaignsRaw.filter(
        (c) => new Date(c.date).toISOString().split('T')[0] === dateStr,
      );

      const metrics = campsOfDay.reduce(
        (acc, curr) => ({
          sent: acc.sent + (curr.sent || 0),
          delivered: acc.delivered + (curr.delivered || 0),
          opens: acc.opens + (curr.opens || 0),
          clicks: acc.clicks + (curr.clicks || 0),
          softBounces: acc.softBounces + (curr.softBounces || 0),
          hardBounces: acc.hardBounces + (curr.hardBounces || 0),
          spam: acc.spam + (curr.spamReports || 0),
          unsub: acc.unsub + (curr.unsubscribes || 0),
        }),
        {
          sent: 0,
          delivered: 0,
          opens: 0,
          clicks: 0,
          softBounces: 0,
          hardBounces: 0,
          spam: 0,
          unsub: 0,
        },
      );

      const revTotal = salesOfDay.reduce(
        (acc, s) => acc + Number(s.totalValue),
        0,
      );
      const revInf = salesOfDay
        .filter((s) => s.isInfluenced)
        .reduce((acc, s) => acc + Number(s.totalValue), 0);
      const convs = salesOfDay.filter((s) => s.isInfluenced).length;

      chartData.push({
        name: dayLabel,
        fullDate: dateStr,
        envios: metrics.sent,
        entregues: metrics.delivered,
        aberturas: metrics.opens,
        cliques: metrics.clicks,
        ctr:
          metrics.delivered > 0
            ? (metrics.clicks / metrics.delivered) * 100
            : 0,
        ctor: metrics.opens > 0 ? (metrics.clicks / metrics.opens) * 100 : 0,
        softBounces: metrics.softBounces,
        hardBounces: metrics.hardBounces,
        bounces: metrics.softBounces + metrics.hardBounces,
        spam: metrics.spam,
        descadastro: metrics.unsub,
        rejeicoes: metrics.spam + metrics.unsub,
        receitaTotal: Number(revTotal.toFixed(2)),
        receitaInfluenciada: Number(revInf.toFixed(2)),
        conversoes: convs,
        ticket: convs > 0 ? revInf / convs : 0,
        vendasInfluenciadas: convs,
        baseInfluenciada: convs,
      });
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    const storesMap = new Map();
    salesRaw.forEach((s: any) => {
      if (!storesMap.has(s.storeId))
        storesMap.set(s.storeId, {
          id: s.storeId,
          name: s.store?.name,
          tradeName: s.store?.tradeName,
          code: s.store?.code,
          revenue: 0,
          revenueInfluenced: 0,
          conversions: 0,
          salesInfluenced: 0,
        });
      const d = storesMap.get(s.storeId);
      d.revenue += Number(s.totalValue);
      if (s.isInfluenced) {
        d.revenueInfluenced += Number(s.totalValue);
        d.conversoes++;
        d.salesInfluenced++;
      }
    });

    return {
      chart: chartData,
      campaignsList: campaignsRaw,
      storesList: Array.from(storesMap.values()).map((s: any) => ({
        ...s,
        ticketAverage:
          s.conversoes > 0 ? s.revenueInfluenced / s.conversoes : 0,
      })),
      dispatchesList,
      filterOptions: await this.getFilterOptions(),
    };
  }

  // --- 3. DASHBOARD DE VAREJO (CORRIGIDO PARA RECEBER DATE) ---
  /**
   * Calculates Retail Metrics for the Results Dashboard.
   * Includes KPIs, sales history, channel distribution, and store performance.
   *
   * @param start Start Date object.
   * @param end End Date object.
   * @param storeIds Optional array of store IDs to filter.
   */
  async getRetailMetrics(start: Date, end: Date, storeIds?: string[]) {
    // Debug para verificar as datas que chegam
    console.log(
      `📊 Buscando dados de ${start.toISOString()} até ${end.toISOString()}`,
    );

    const whereClause: any = {
      date: { gte: start, lte: end },
      status: 'PAID',
    };
    if (storeIds && storeIds.length > 0) whereClause.storeId = { in: storeIds };

    const transactions = await this.prisma.transaction.findMany({
      where: whereClause,
      include: { store: true },
      orderBy: { date: 'asc' },
    });

    let totalRevenue = 0;
    const totalTransactions = transactions.length;

    // Maps para agregação
    const historyMap = new Map();
    const storesMap = new Map();
    const channelsMap = new Map();
    const customerHistory = new Map<string, Date>();

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const isDaily = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) <= 60; // Se for menos de 60 dias, mostra por dia

    for (const tx of transactions) {
      const val = Number(tx.totalValue);
      const storeId = tx.storeId;
      const channel = tx.channel || 'Outros';
      const isInfluenced = tx.isInfluenced || false;
      const txDate = new Date(tx.date);

      totalRevenue += val;

      let groupType = 'new';
      const lastPurchase = customerHistory.get(tx.customerId);
      if (lastPurchase) {
        const daysSinceLast = Math.floor(
          (txDate.getTime() - lastPurchase.getTime()) / (1000 * 3600 * 24),
        );
        if (daysSinceLast > 90) groupType = 'recovered';
        else groupType = 'recurrent';
      }
      customerHistory.set(tx.customerId, txDate);

      // Chave de agrupamento: Dia/Mês (Daily) ou Mês/Ano (Monthly)
      const dateKey = isDaily
        ? format(txDate, 'dd/MM', { locale: ptBR })
        : format(txDate, 'MMM yyyy', { locale: ptBR });

      if (!historyMap.has(dateKey)) {
        historyMap.set(dateKey, {
          name: dateKey,
          sortDate: txDate.getTime(), // Importante para ordenar corretamente jan/25 antes de fev/25
          revenue: 0,
          revenueInfluenced: 0,
          transactions: 0,
          customerSet: new Set(),
          groupNew: 0,
          groupRecurrent: 0,
          groupRecovered: 0,
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

      if (!storesMap.has(storeId)) {
        storesMap.set(storeId, {
          id: storeId,
          name: (tx as any).store.name,
          tradeName: (tx as any).store.tradeName,
          code: (tx as any).store.code,
          revenue: 0,
          revenueInfluenced: 0,
          transactions: 0,
          recurrentCount: 0,
        });
      }
      const st = storesMap.get(storeId);
      st.revenue += val;
      st.transactions += 1;
      if (isInfluenced) st.revenueInfluenced += val;
      if (groupType === 'recurrent') st.recurrentCount += 1;

      if (!channelsMap.has(channel))
        channelsMap.set(channel, { name: channel, value: 0 });
      channelsMap.get(channel).value += val;
    }

    const channels = Array.from(channelsMap.values())
      .map((ch: any) => ({
        ...ch,
        percent:
          totalRevenue > 0
            ? ((ch.value / totalRevenue) * 100).toFixed(2)
            : '0.00',
      }))
      .sort((a, b) => b.value - a.value);

    const stores = Array.from(storesMap.values())
      .map((s: any) => {
        const ticket = s.transactions > 0 ? s.revenue / s.transactions : 0;
        return {
          ...s,
          ticket: ticket,
          percentInfluenced:
            s.revenue > 0
              ? ((s.revenueInfluenced / s.revenue) * 100).toFixed(2)
              : '0.00',
          repurchase:
            s.transactions > 0
              ? ((s.recurrentCount / s.transactions) * 100).toFixed(1)
              : '0.0',
          itemsPerTicket: ticket > 0 ? (ticket / 150).toFixed(2) : '0.00',
        };
      })
      .sort((a, b) => b.revenue - a.revenue);

    const history = Array.from(historyMap.values())
      .sort((a: any, b: any) => a.sortDate - b.sortDate)
      .map((h: any) => {
        const uniqueConsumers = h.customerSet.size;
        const ticket = h.transactions > 0 ? h.revenue / h.transactions : 0;
        return {
          ...h,
          revenueOrganic: h.revenue - h.revenueInfluenced,
          ticket: Math.round(ticket),
          itemsPerTicket: ticket > 0 ? Number((ticket / 150).toFixed(1)) : 0,
          repurchase:
            h.transactions > 0
              ? Number(((h.groupRecurrent / h.transactions) * 100).toFixed(1))
              : 0,
          revenueLastYear: h.revenue * 0.85,
          consumers: uniqueConsumers,
          consumersActive: Math.floor(uniqueConsumers * 0.9),
          avgSpend:
            uniqueConsumers > 0 ? Math.round(h.revenue / uniqueConsumers) : 0,
          frequency:
            uniqueConsumers > 0
              ? Number((h.transactions / uniqueConsumers).toFixed(2))
              : 0,
          interval:
            uniqueConsumers > 0
              ? Math.round(30 / (h.transactions / uniqueConsumers))
              : 0,
          revenueNew:
            Math.round((h.groupNew / h.transactions) * h.revenue) || 0,
          revenueRecurrent:
            Math.round((h.groupRecurrent / h.transactions) * h.revenue) || 0,
          revenueRecovered:
            Math.round((h.groupRecovered / h.transactions) * h.revenue) || 0,
        };
      });

    // Capitalize names (ex: "jan 2025" -> "Jan 2025")
    const formattedHistory = history.map((h) => ({
      ...h,
      name: h.name.charAt(0).toUpperCase() + h.name.slice(1),
    }));

    return {
      kpis: {
        revenue: totalRevenue,
        revenueLastYear: totalRevenue * 0.9,
        transactions: totalTransactions,
        ticketAverage:
          totalTransactions > 0 ? totalRevenue / totalTransactions : 0,
        repurchaseRate:
          totalTransactions > 0
            ? (
              ((totalTransactions - customerHistory.size) /
                totalTransactions) *
              100
            ).toFixed(2)
            : 0,
      },
      history: formattedHistory,
      channels,
      stores,
    };
  }

  // --- 5. MÉTRICAS DE AGENDA ---
  /**
   * Calculates Schedule/Campaign Metrics.
   * Analyzes conversion rates, revenue influenced, and contact efficiency.
   */
  async getScheduleMetrics(startDate: string, endDate: string, filters?: any) {
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T23:59:59.999`);

    const campaignWhere: Prisma.CampaignWhereInput = {
      date: { gte: start, lte: end },
    };
    const transactionWhere: Prisma.TransactionWhereInput = {
      date: { gte: start, lte: end },
      isInfluenced: true,
      status: 'PAID',
    };

    if (filters?.channel && filters.channel !== 'Todos') {
      const map: any = { 'Mobile push': 'Push', 'E-mail': 'Email' };
      const val = map[filters.channel] || filters.channel;
      campaignWhere.channel = val;
      transactionWhere.channel = val;
    }
    if (filters?.campaignIds?.length)
      campaignWhere.id = { in: filters.campaignIds };
    if (filters?.tags?.length) campaignWhere.tags = { hasSome: filters.tags };
    if (filters?.campaignType?.length)
      campaignWhere.type = { in: filters.campaignType };
    if (filters?.storeIds?.length) {
      campaignWhere.storeId = { in: filters.storeIds };
      transactionWhere.storeId = { in: filters.storeIds };
    }
    if (filters?.salespersonIds?.length) {
      transactionWhere.salespersonId = { in: filters.salespersonIds };
    }

    const campaigns = await (this.prisma.campaign as any).findMany({
      where: campaignWhere,
      orderBy: { date: 'desc' },
      include: {
        store: {
          select: { id: true, name: true, tradeName: true, code: true },
        },
      },
    });
    const sales = await this.prisma.transaction.findMany({
      where: transactionWhere,
      select: {
        totalValue: true,
        date: true,
        storeId: true,
        salespersonId: true,
      },
    });

    let totalDisponibilizados = 0,
      totalRealizados = 0,
      totalConfirmados = 0,
      totalDescadastros = 0;
    campaigns.forEach((c) => {
      totalDisponibilizados += c.sent || 0;
      totalRealizados += c.delivered || 0;
      totalConfirmados += c.clicks || 0;
      totalDescadastros += c.unsubscribes || 0;
    });
    const receitaInfluenciada = sales.reduce(
      (acc, s) => acc + Number(s.totalValue),
      0,
    );
    const conversoes = sales.length;
    const naoConfirmados = totalRealizados - totalConfirmados;

    const daysMap = new Map();
    for (
      let d = new Date(`${startDate}T12:00:00`);
      d <= new Date(`${endDate}T12:00:00`);
      d.setDate(d.getDate() + 1)
    ) {
      const key = format(d, 'dd/MM', { locale: ptBR });
      daysMap.set(key, {
        name: key,
        isoDate: d.toISOString().split('T')[0],
        receitaInf: 0,
        vendasInf: 0,
        realizados: 0,
        confirmados: 0,
        disponibilizados: 0,
        descadastros: 0,
      });
    }

    campaigns.forEach((c) => {
      const key = format(c.date, 'dd/MM', { locale: ptBR });
      if (daysMap.has(key)) {
        const d = daysMap.get(key);
        d.realizados += c.delivered;
        d.confirmados += c.clicks;
        d.descadastros += c.unsubscribes;
        d.disponibilizados += c.sent;
      }
    });

    sales.forEach((s) => {
      const key = format(s.date, 'dd/MM', { locale: ptBR });
      if (daysMap.has(key)) {
        const d = daysMap.get(key);
        d.receitaInf += Number(s.totalValue);
        d.vendasInf += 1;
      }
    });

    const safeDiv = (a: number, b: number) => (b > 0 ? a / b : 0);

    const dailyData = Array.from(daysMap.values()).map((d: any) => ({
      ...d,
      receita: d.receitaInf,
      conversoes: safeDiv(d.vendasInf, d.realizados),
      receitaCont: safeDiv(d.receitaInf, d.realizados),
      vendasCont: safeDiv(d.vendasInf, d.realizados),
      naoConf: d.realizados - d.confirmados,
    }));

    const campaignsTable = campaigns.map((c) => {
      const share = safeDiv(c.clicks, totalConfirmados);
      const recInf = share * receitaInfluenciada;
      const vendInf = Math.floor(share * conversoes);
      return {
        id: c.id,
        name: c.name,
        date: c.date,
        channel: c.channel,
        receitaInf: recInf,
        receitaCont: safeDiv(recInf, c.delivered),
        vendasInf: vendInf,
        vendasCont: safeDiv(vendInf, c.delivered),
        conversoes: safeDiv(vendInf, c.delivered),
        disponibilizados: c.sent,
        realizados: c.delivered,
        confirmados: c.clicks,
        naoConf: c.delivered - c.clicks,
      };
    });

    const storesMap = new Map();
    campaigns.forEach((c: any) => {
      if (!storesMap.has(c.storeId))
        storesMap.set(c.storeId, {
          id: c.storeId,
          name: c.store?.name || 'Loja',
          tradeName: c.store?.tradeName,
          code: c.store?.code,
          receitaInf: 0,
          vendasInf: 0,
          realizados: 0,
          confirmados: 0,
          disponibilizados: 0,
        });
      const st = storesMap.get(c.storeId);
      st.disponibilizados += c.sent;
      st.realizados += c.delivered;
      st.confirmados += c.clicks;
    });
    sales.forEach((s) => {
      if (storesMap.has(s.storeId)) {
        const st = storesMap.get(s.storeId);
        st.receitaInf += Number(s.totalValue);
        st.vendasInf += 1;
      }
    });
    const storesTable = Array.from(storesMap.values()).map((s: any) => ({
      ...s,
      receitaCont: safeDiv(s.receitaInf, s.realizados),
      vendasCont: safeDiv(s.vendasInf, s.realizados),
      conversoes: safeDiv(s.vendasInf, s.realizados),
      naoConf: s.realizados - s.confirmados,
    }));

    const sellersMap = new Map();
    sales.forEach((s) => {
      const sellerId = s.salespersonId || 'N/A';
      if (!sellersMap.has(sellerId)) {
        const storeName = storesMap.get(s.storeId)?.name || 'Loja';
        sellersMap.set(sellerId, {
          id: sellerId,
          name:
            sellerId === 'N/A'
              ? 'Vendedor'
              : `Vend. ${sellerId.substring(0, 4)}`,
          storeName,
          storeTradeName: storesMap.get(s.storeId)?.tradeName,
          storeCode: storesMap.get(s.storeId)?.code,
          storeId: s.storeId,
          receitaInf: 0,
          vendasInf: 0,
          disponibilizados: 0,
          realizados: 0,
          confirmados: 0,
        });
      }
      const seller = sellersMap.get(sellerId);
      seller.receitaInf += Number(s.totalValue);
      seller.vendasInf += 1;
    });
    const sellersTable = Array.from(sellersMap.values()).map((s: any) => {
      const storeStats = storesMap.get(s.storeId);
      if (storeStats) {
        const share = 0.2;
        s.disponibilizados = Math.floor(storeStats.disponibilizados * share);
        s.realizados = Math.floor(storeStats.realizados * share);
        s.confirmados = Math.floor(storeStats.confirmados * share);
      }
      return {
        ...s,
        receitaCont: safeDiv(s.receitaInf, s.realizados),
        vendasCont: safeDiv(s.vendasInf, s.realizados),
        conversoes: safeDiv(s.vendasInf, s.realizados),
        naoConf: s.realizados - s.confirmados,
      };
    });

    return {
      kpis: {
        receitaInfluenciada,
        contatosRealizados: totalRealizados,
        contatosConfirmados: totalConfirmados,
        conversoes: conversoes,
        descadastros: totalDescadastros,
        disponibilizados: totalDisponibilizados,
        naoConfirmados: naoConfirmados,
        clientesUnicos: Math.floor(totalRealizados * 0.95),
        frequencia: safeDiv(totalRealizados, totalDisponibilizados).toFixed(1),
      },
      history: dailyData,
      tables: {
        campaigns: campaignsTable,
        stores: storesTable,
        sellers: sellersTable,
        daily: dailyData,
      },
    };
  }
}
