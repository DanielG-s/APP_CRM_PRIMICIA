import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; // Ajuste o caminho se necessário
import { Prisma } from '@prisma/client';
import { Cron, CronExpression } from '@nestjs/schedule'; // IMPORTANTE PARA O AGENDADOR

@Injectable()
export class IntelligenceService {
  constructor(private prisma: PrismaService) {}

  // ===========================================================================
  // 1. DASHBOARD RFM (Otimizado via Banco de Dados)
  // ===========================================================================
  async getRfmAnalysis() {
    const groups = await this.prisma.customer.groupBy({
      by: ['rfmStatus'],
      _count: { id: true }
    });

    const resultMap = {
      'Champions': { value: 0, color: '#10b981' },
      'Leais': { value: 0, color: '#3b82f6' }, 
      'Recentes': { value: 0, color: '#6366f1' },
      'Em Risco': { value: 0, color: '#f59e0b' },
      'Hibernando': { value: 0, color: '#ef4444' },
      'Novos / Sem Dados': { value: 0, color: '#9ca3af' }
    };

    groups.forEach(g => {
        const key = g.rfmStatus || 'Novos / Sem Dados';
        let mapKey = key;
        
        if (key.includes('Champions')) mapKey = 'Champions';
        if (key.includes('Leais')) mapKey = 'Leais';
        if (key.includes('Recentes')) mapKey = 'Recentes';
        if (key.includes('Risco')) mapKey = 'Em Risco';
        if (key.includes('Hibernando')) mapKey = 'Hibernando';

        if (resultMap[mapKey] && g._count) {
            resultMap[mapKey].value += (g._count as any).id || 0;
        }
    });

    return Object.keys(resultMap).map(k => ({
        name: k,
        value: resultMap[k].value,
        color: resultMap[k].color
    }));
  }

  // ===========================================================================
  // 2. ENGINE DE CÁLCULO REAL (DIRETO NO BANCO - ESCALÁVEL)
  // ===========================================================================
  async calculatePreview(rules: any[]) {
    const whereClause = this.buildWhereClause(rules);

    const totalClients = await this.prisma.customer.count({ where: whereClause });
    const totalDatabase = await this.prisma.customer.count();

    const matchedClients = await this.prisma.customer.findMany({
      where: whereClause,
      take: 10,
      select: {
        id: true, name: true, email: true, city: true, state: true, rfmStatus: true,
      }
    });

    const aggregates = await this.prisma.customer.aggregate({
      where: whereClause,
      _sum: { totalSpent: true },
      _count: { id: true }
    });

    const channelCounts = await this.prisma.customer.aggregate({
        where: whereClause,
        _count: {
            email: true,
            phone: true
        }
    });

    return {
      metrics: {
        total: totalClients,
        percent: totalDatabase > 0 ? ((totalClients / totalDatabase) * 100).toFixed(1) : 0,
        revenue: {
          total: Number(aggregates._sum.totalSpent || 0),
          buyers: aggregates._count.id,
          orders_count: 0
        },
        channels: {
          email: channelCounts._count.email || 0,
          whatsapp: channelCounts._count.phone || 0 
        }
      },
      matchedClients: matchedClients.map(c => ({
        ...c,
        rfm: c.rfmStatus || 'Novos / Sem Dados'
      }))
    };
  }

  // ===========================================================================
  // 3. O TRADUTOR (JSON -> PRISMA WHERE)
  // ===========================================================================
  private buildWhereClause(rules: any[]): Prisma.CustomerWhereInput {
    if (!rules || rules.length === 0) return {};

    const andConditions: Prisma.CustomerWhereInput[] = [];
    const orConditions: Prisma.CustomerWhereInput[] = [];

    rules.forEach((block, index) => {
      let condition: Prisma.CustomerWhereInput | undefined;

      if (block.category === 'characteristic') {
        condition = this.mapCharacteristicToPrisma(block);
      } else if (block.category === 'rfm') {
        condition = { rfmStatus: { contains: block.status, mode: 'insensitive' } };
      } else if (block.category === 'behavioral') {
        condition = this.mapBehaviorToPrisma(block);
      }

      if (condition) {
        if (index === 0) {
          andConditions.push(condition);
        } else {
          if (block.logicOperator === 'OR') orConditions.push(condition);
          else andConditions.push(condition);
        }
      }
    });

    if (orConditions.length > 0) {
      return { AND: [...andConditions, { OR: orConditions }] };
    }
    return { AND: andConditions };
  }

  private mapCharacteristicToPrisma(block: any): Prisma.CustomerWhereInput {
    const { field, operator, value } = block;
    const mode = 'insensitive';

    if (field === 'totalSpent' || field === 'ordersCount') {
        const numVal = Number(value);
        if (operator === 'greater_than') return { [field]: { gt: numVal } };
        if (operator === 'less_than') return { [field]: { lt: numVal } };
        if (operator === 'equals') return { [field]: { equals: numVal } };
    }

    switch (operator) {
      case 'equals': return { [field]: { equals: value, mode } };
      case 'not_equals': return { [field]: { not: { equals: value, mode } } };
      case 'contains': return { [field]: { contains: value, mode } };
      case 'is_set': return { [field]: { not: null } };
      case 'is': return { [field]: value === 'true' };
      default: return {};
    }
  }

  private mapBehaviorToPrisma(block: any): Prisma.CustomerWhereInput {
    if (block.event.includes('pedido') || block.event.includes('comprou')) {
        
        if (!block.filters || block.filters.length === 0) {
            const basicCondition = { transactions: { some: {} } };
            return block.type === 'did_not' ? { NOT: basicCondition } : basicCondition;
        }

        const andFilters: Prisma.TransactionWhereInput[] = [];

        for (const f of block.filters) {
            const rawVal = f.value;
            const numVal = Number(String(rawVal).replace(/[^0-9.-]+/g,"")) || 0;

            if (['total', 'subtotal', 'valor', 'price'].includes(f.field)) {
                if (f.operator === 'greater_than') andFilters.push({ totalValue: { gt: numVal } });
                else if (f.operator === 'less_than') andFilters.push({ totalValue: { lt: numVal } });
                else if (f.operator === 'equals') andFilters.push({ totalValue: { equals: numVal } });
            } else if (['date', 'data', 'created_at'].includes(f.field)) {
                const dateVal = this.parseRelativeDate(String(rawVal));
                if (dateVal) {
                    if (f.operator === 'greater_than') andFilters.push({ date: { gte: dateVal } });
                    else if (f.operator === 'less_than') andFilters.push({ date: { lte: dateVal } });
                    else if (f.operator === 'equals') {
                        const nextDay = new Date(dateVal);
                        nextDay.setDate(nextDay.getDate() + 1);
                        andFilters.push({ date: { gte: dateVal, lt: nextDay } });
                    }
                }
            } else if (['produto_id', 'nome_produto', 'name'].includes(f.field)) {
                andFilters.push({
                    items: {
                        array_contains: [{ name: rawVal }]
                    }
                } as any);
            } else if (['categoria', 'category', 'nome_categoria'].includes(f.field)) {
                andFilters.push({
                    items: {
                        array_contains: [{ category: rawVal }]
                    }
                } as any);
            }
        }

        if (andFilters.length > 0) {
            const relationCondition = { transactions: { some: { AND: andFilters } } };
            return block.type === 'did_not' ? { NOT: relationCondition } : relationCondition;
        }
        
        return { transactions: { some: {} } };
    }

    return {};
  }

  private parseRelativeDate(value: string): Date | null {
      const now = new Date();
      if (value === 'Hoje') return new Date(now.setHours(0,0,0,0));
      if (value === 'Ontem') { const d = new Date(); d.setDate(d.getDate() - 1); d.setHours(0,0,0,0); return d; }
      
      if (value.includes('Últimos')) {
          const days = parseInt(value.replace(/\D/g, '')) || 30;
          const d = new Date(); d.setDate(d.getDate() - days);
          return d;
      }
      const parsed = new Date(value);
      return isNaN(parsed.getTime()) ? null : parsed;
  }

  // ===========================================================================
  // 4. MANUTENÇÃO AUTOMÁTICA (CRON JOB) E LISTAGEM COM TENDÊNCIA
  // ===========================================================================
  
  // Roda toda madrugada às 03:00 para salvar o tamanho do segmento
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleDailySegmentSnapshot() {
    console.log('📸 Iniciando snapshot diário dos segmentos...');
    
    const segments = await this.prisma.segment.findMany({ where: { active: true } });

    for (const seg of segments) {
        try {
            // Calcula tamanho atual
            const whereClause = this.buildWhereClause(seg.rules as any);
            const currentCount = await this.prisma.customer.count({ where: whereClause });

            // Salva no Histórico
            await this.prisma.segmentHistory.create({
                data: {
                    segmentId: seg.id,
                    count: currentCount,
                    date: new Date()
                }
            });

            // Atualiza cache rápido
            await this.prisma.segment.update({
                where: { id: seg.id },
                data: { lastCount: currentCount }
            });

        } catch (error) {
            console.error(`Erro ao processar snapshot do segmento ${seg.name}:`, error);
        }
    }
    console.log('✅ Snapshot diário concluído.');
  }

  // LISTAGEM NOVA: Traz segmentos + tendência (crescimento vs ontem)
  // Substitua a chamada no Controller para usar ESTE método
  async findAllSegmentsWithTrend() {
    const totalCustomers = await this.prisma.customer.count();
    
    const segments = await this.prisma.segment.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        updatedBy: { select: { name: true, email: true } },
        history: {
            orderBy: { date: 'desc' },
            take: 1,
            skip: 1 // Pega o PENÚLTIMO registro (ontem), pois o último seria o de hoje (se já rodou)
        }
      }
    });

    const formattedSegments = segments.map(seg => {
        const currentCount = seg.lastCount;
        const previousCount = seg.history[0]?.count || currentCount; // Se não tiver histórico, assume variação 0
        
        let trendPercent = 0;
        if (previousCount > 0) {
            trendPercent = ((currentCount - previousCount) / previousCount) * 100;
        }

        return {
            ...seg,
            metrics: {
                totalBase: totalCustomers,
                reachPercent: totalCustomers > 0 ? ((currentCount / totalCustomers) * 100).toFixed(1) : 0,
                trend: trendPercent.toFixed(1)
            }
        };
    });

    return { segments: formattedSegments, totalCustomers };
  }

  // ===========================================================================
  // 5. CRUD (CREATE / UPDATE ATUALIZADOS PARA SALVAR LASTCOUNT)
  // ===========================================================================

  async createSegment(data: { name: string; rules: any; isDynamic: boolean }) {
    const store = await this.prisma.store.findFirst();
    const existingSegment = await this.prisma.segment.findFirst({
      where: { name: { equals: data.name, mode: 'insensitive' }, storeId: store?.id }
    });

    if (existingSegment) throw new ConflictException('Já existe um segmento com este nome.');

    // Calcula tamanho inicial para já mostrar na listagem
    const whereClause = this.buildWhereClause(data.rules);
    const count = await this.prisma.customer.count({ where: whereClause });

    return this.prisma.segment.create({
      data: {
        name: data.name,
        rules: data.rules,
        logic: 'custom',
        active: true,
        storeId: store?.id || 'default',
        isDynamic: data.isDynamic,
        lastCount: count // <--- Salva tamanho inicial
      },
    });
  }

  async updateSegment(id: string, data: { name: string; rules: any; isDynamic: boolean }, userId?: string) {
    const existing = await this.prisma.segment.findFirst({
        where: { name: { equals: data.name, mode: 'insensitive' }, id: { not: id } }
    });
    if (existing) throw new ConflictException('Já existe outro segmento com este nome.');

    // Recalcula tamanho ao editar
    const whereClause = this.buildWhereClause(data.rules);
    const count = await this.prisma.customer.count({ where: whereClause });

    return this.prisma.segment.update({
        where: { id },
        data: {
            name: data.name,
            rules: data.rules,
            isDynamic: data.isDynamic,
            updatedById: userId,
            lastCount: count // <--- Atualiza tamanho
        }
    });
  }

  // ===========================================================================
  // 6. MÉTODOS AUXILIARES (Opções de Filtro, Delete, Toggle)
  // ===========================================================================
  
  async getFilterOptions() {
    const citiesRaw = await this.prisma.customer.findMany({
      where: { city: { not: null } }, select: { city: true }, distinct: ['city'], orderBy: { city: 'asc' }
    });
    const statesRaw = await this.prisma.customer.findMany({
      where: { state: { not: null } }, select: { state: true }, distinct: ['state'], orderBy: { state: 'asc' }
    });

    const segmentsRaw = await this.prisma.segment.findMany({
        where: { active: true }, select: { id: true, name: true }, orderBy: { name: 'asc' }
    });

    const recentTransactions = await this.prisma.transaction.findMany({
      take: 1000, orderBy: { date: 'desc' }, select: { items: true }
    });

    const categoriesSet = new Set<string>();
    const productsSet = new Set<string>();

    recentTransactions.forEach(t => {
      const items = (t.items as any[]) || [];
      items.forEach(item => {
        if (item.name) productsSet.add(item.name);
        if (item.category) categoriesSet.add(item.category);
      });
    });

    return {
      cities: citiesRaw.map(c => c.city).filter(Boolean),
      states: statesRaw.map(s => s.state).filter(Boolean),
      segments: segmentsRaw,
      products: Array.from(productsSet).sort(),
      categories: Array.from(categoriesSet).sort(),
      campaigns: [], departments: [], search_terms: []
    };
  }

  // Método legado mantido para compatibilidade, caso algo ainda chame
  async findAllSegments() {
     return this.findAllSegmentsWithTrend();
  }
  
  async getSegmentationData() { return { clients: [], events: [], orders: [] }; }
  
  async getSegmentById(id: string) {
    const segment = await this.prisma.segment.findUnique({ where: { id } });
    if (!segment) throw new Error('Segmento não encontrado');
    return segment;
  }

  async toggleSegmentStatus(id: string) {
    const s = await this.prisma.segment.findUnique({ where: { id } });
    if (!s) throw new Error('Segmento não encontrado');
    return this.prisma.segment.update({ where: { id }, data: { active: !s.active } });
  }

  async deleteSegment(id: string) {
    return this.prisma.segment.delete({ where: { id } });
  }
  
  // Método auxiliar para atualizar métricas do cliente (chamado por webhooks de venda)
  async updateCustomerMetrics(customerId: string) {
    const aggregates = await this.prisma.transaction.aggregate({
        where: { customerId },
        _sum: { totalValue: true },
        _count: { id: true },
        _max: { date: true }
    });

    const totalSpent = aggregates._sum.totalValue || 0;
    const ordersCount = aggregates._count.id || 0;
    const lastOrderDate = aggregates._max.date;

    let rfmStatus = 'Novos / Sem Dados';
    if (ordersCount > 0 && lastOrderDate) {
        const daysSince = Math.floor((new Date().getTime() - lastOrderDate.getTime()) / (1000 * 3600 * 24));
        if (daysSince > 180) rfmStatus = 'Hibernando';
        else if (daysSince > 90) rfmStatus = 'Em Risco';
        else if (Number(totalSpent) > 1000 || ordersCount > 5) rfmStatus = 'Champions';
        else if (ordersCount > 1) rfmStatus = 'Leais';
        else rfmStatus = 'Recentes';
    }

    await this.prisma.customer.update({
        where: { id: customerId },
        data: {
            totalSpent: new Prisma.Decimal(Number(totalSpent)),
            ordersCount,
            lastOrderDate,
            rfmStatus
        }
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleDailyUpdate() {
    console.log('🤖 [CRON] Iniciando atualização diária dos segmentos...');
    
    // 1. Busca todos os segmentos ativos
    const segments = await this.prisma.segment.findMany({
      where: { active: true }
    });

    for (const segment of segments) {
      let currentCount = segment.lastCount;

      // 2. Se for Dinâmico, recalcula a contagem atual
      if (segment.isDynamic) {
        try {
          // Reaproveita sua lógica de filtro para contar (Assumindo que countPreview existe ou similar)
          // Se não tiver um método separado, usamos a lógica de construção de query aqui:
          const whereClause = this.buildWhereFromRules(segment.rules as any[]);
          currentCount = await this.prisma.customer.count({ where: whereClause });
          
          // Atualiza o valor no Segmento principal
          await this.prisma.segment.update({
             where: { id: segment.id },
             data: { lastCount: currentCount }
          });
        } catch (error) {
          console.error(`Erro ao atualizar segmento ${segment.name}:`, error);
        }
      } 
      // Se for Estático, mantemos o 'currentCount' antigo, mas registramos no histórico
      // para que o gráfico não tenha "buracos" no dia de hoje.

      // 3. Salva o "Retrato" no Histórico (Para o gráfico Sparkline)
      await this.prisma.segmentHistory.create({
        data: {
          segmentId: segment.id,
          count: currentCount,
          date: new Date() // Data de hoje
        }
      });
    }

    console.log(`✅ [CRON] ${segments.length} segmentos atualizados e históricos salvos.`);
  }

  // --- HELPER: CONSTRUTOR DE QUERY ---
  private buildWhereFromRules(rules: any[]): Prisma.CustomerWhereInput {
     if (!rules || rules.length === 0) return {};
     
     // Array explícito do tipo CustomerWhereInput
     const conditions: Prisma.CustomerWhereInput[] = [];

     for (const rule of rules) {
        // Lógica para Total Gasto
        if (rule.field === 'total_spent') {
            const val = parseFloat(rule.value);
            if (!isNaN(val)) {
                if (rule.operator === 'gt') conditions.push({ totalSpent: { gt: val } });
                else if (rule.operator === 'lt') conditions.push({ totalSpent: { lt: val } });
                else if (rule.operator === 'gte') conditions.push({ totalSpent: { gte: val } });
                else if (rule.operator === 'lte') conditions.push({ totalSpent: { lte: val } });
            }
        }
        
        // Lógica para Cidade (Com correção de tipagem 'as const')
        if (rule.field === 'city' && rule.value) {
            conditions.push({ 
                city: { contains: rule.value, mode: 'insensitive' as const } 
            });
        }

        // Lógica para Estado
        if (rule.field === 'state' && rule.value) {
             conditions.push({ 
                state: { equals: rule.value, mode: 'insensitive' as const } 
             });
        }

        // Adicione outros campos aqui conforme necessário (ex: lastOrderDate)
     }

     // Se não gerou nenhuma condição válida, retorna objeto vazio (busca tudo)
     if (conditions.length === 0) return {};

     return { AND: conditions };
  }

  // --- EXPORTAR CSV ---
  async exportSegmentToCsv(segmentId: string): Promise<string> {
    // 1. Busca as regras do segmento
    const segment = await this.prisma.segment.findUnique({
      where: { id: segmentId }
    });

    if (!segment) throw new Error('Segmento não encontrado');

    // 2. Constrói o filtro (WHERE) baseado nas regras
    const whereClause = this.buildWhereFromRules(segment.rules as any[]);

    // 3. Busca os clientes (Aqui limitamos a 5000 para não travar o servidor, 
    // em produção usaria Streams para milhões de linhas)
    const customers = await this.prisma.customer.findMany({
      where: whereClause,
      take: 10000, 
      orderBy: { name: 'asc' },
      select: {
        name: true,
        email: true,
        phone: true,
        city: true,
        state: true,
        totalSpent: true,
        lastOrderDate: true
      }
    });

    // 4. Monta o CSV manualmente (Cabeçalho + Linhas)
    const header = 'Nome,Email,Telefone,Cidade,UF,Total Gasto,Ultima Compra\n';
    
    const rows = customers.map(c => {
      // Tratamento para evitar quebra se tiver vírgula no nome
      const safeName = c.name ? `"${c.name.replace(/"/g, '""')}"` : '';
      const safeCity = c.city ? `"${c.city}"` : '';
      const date = c.lastOrderDate ? c.lastOrderDate.toISOString().split('T')[0] : '';
      
      return `${safeName},${c.email || ''},${c.phone || ''},${safeCity},${c.state || ''},${c.totalSpent || 0},${date}`;
    }).join('\n');

    return header + rows;
  }
}