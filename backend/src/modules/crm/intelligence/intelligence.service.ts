import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class IntelligenceService {
  constructor(private prisma: PrismaService) {}

  // ===========================================================================
  // 1. MÉTODO EXISTENTE (DASHBOARD) - PRESERVADO
  // ===========================================================================
  async getRfmAnalysis() {
    // 1. Busca todos os clientes com suas transações
    const customers = await this.prisma.customer.findMany({
      include: { transactions: true }
    });

    let vips = 0;
    let ativos = 0;
    let emRisco = 0;
    let perdidos = 0;

    const hoje = new Date();

    customers.forEach(customer => {
      // Se não tem transação, é "Novo/Sem Dados"
      if (customer.transactions.length === 0) return;

      // Calcula total gasto
      const totalGasto = customer.transactions.reduce((acc, t) => acc + Number(t.totalValue), 0);
      
      // Encontra a data da última compra
      const ultimaCompra = customer.transactions
        .map(t => new Date(t.date).getTime())
        .sort((a, b) => b - a)[0];
      
      const diasSemComprar = Math.floor((hoje.getTime() - ultimaCompra) / (1000 * 60 * 60 * 24));

      // --- REGRA DE NEGÓCIO RFM (SIMPLIFICADA) ---
      if (totalGasto > 1000 && diasSemComprar < 30) {
        vips++; // Gastou muito e comprou recente
      } else if (diasSemComprar <= 60) {
        ativos++; // Comprou nos últimos 2 meses
      } else if (diasSemComprar <= 120) {
        emRisco++; // Não compra há 4 meses
      } else {
        perdidos++; // Sumiu há mais de 4 meses
      }
    });

    // Retorna formatado para o Gráfico de Pizza
    return [
      { name: 'VIPs', value: vips, color: '#10b981' },      // Verde
      { name: 'Ativos', value: ativos, color: '#3b82f6' },    // Azul
      { name: 'Em Risco', value: emRisco, color: '#f59e0b' }, // Laranja
      { name: 'Perdidos', value: perdidos, color: '#ef4444' } // Vermelho
    ];
  }

  // ===========================================================================
  // 2. DADOS INICIAIS (CARREGAMENTO DA PÁGINA)
  // ===========================================================================
  async getSegmentationData() {
    const customers = await this.prisma.customer.findMany({ include: { store: { select: { name: true } } } });
    const events = await this.prisma.customerEvent.findMany({ orderBy: { createdAt: 'desc' }, take: 5000 });
    const orders = await this.prisma.transaction.findMany({ orderBy: { date: 'desc' }, take: 5000 });

    return { 
        clients: this.formatClients(customers), 
        events: this.formatEvents(events), 
        orders: this.formatOrders(orders) 
    };
  }

  // ===========================================================================
  // 3. SALVAR SEGMENTO (COM IS_DYNAMIC)
  // ===========================================================================
  async createSegment(data: { name: string; rules: any; isDynamic: boolean }) {
    const store = await this.prisma.store.findFirst();
    if (!store) throw new Error("Nenhuma loja encontrada.");

    const existingSegment = await this.prisma.segment.findFirst({
      where: { 
        name: { equals: data.name, mode: 'insensitive' },
        storeId: store.id 
      }
    });

    if (existingSegment) throw new ConflictException('Já existe um segmento com este nome.');

    return this.prisma.segment.create({
      data: {
        name: data.name,
        rules: data.rules,
        logic: 'custom',
        active: true,
        storeId: store.id,
        isDynamic: data.isDynamic,
      },
    });
  }

  // ===========================================================================
  // 4. ENGINE DE CÁLCULO (PREVIEW)
  // ===========================================================================
  async calculatePreview(rules: any[]) {
    // Busca dados otimizados (sem includes desnecessários)
    const customers = await this.prisma.customer.findMany(); 
    const orders = await this.prisma.transaction.findMany(); 
    const events = await this.prisma.customerEvent.findMany({ 
        where: { createdAt: { gte: new Date(new Date().setDate(new Date().getDate() - 90)) } } // Últimos 90 dias de eventos
    });

    // Formata e Calcula o RFM individualmente para o filtro
    const formattedOrders = this.formatOrders(orders);
    const clientsWithRFM = this.formatClientsWithRFM(customers, formattedOrders);

    const db = {
        clients: clientsWithRFM,
        events: this.formatEvents(events),
        orders: formattedOrders
    };

    return this.evaluateRuleEngine(db, rules);
  }

  // ===========================================================================
  // HELPERS PRIVADOS
  // ===========================================================================

  private formatClients(customers: any[]) {
    return customers.map(c => {
        const extraData = (c.dataQualityIssues ? c.dataQualityIssues : {}) as any;
        return {
            id: c.id,
            name: c.name,
            email: c.email,
            city: c.city,
            state: c.state,
            has_android: extraData.has_android || false,
            gender: extraData.gender || 'Não informado',
            channels: extraData.channels || { email: true, whatsapp: false },
        };
    });
  }

  // Helper especial que injeta o status RFM no objeto do cliente
  private formatClientsWithRFM(customers: any[], orders: any[]) {
    const ordersByClient = new Map();
    orders.forEach(o => {
        if (!ordersByClient.has(o.client_id)) ordersByClient.set(o.client_id, []);
        ordersByClient.get(o.client_id).push(o);
    });

    const now = new Date();

    return customers.map(c => {
        const extraData = (c.dataQualityIssues ? c.dataQualityIssues : {}) as any;
        const clientOrders = ordersByClient.get(c.id) || [];
        
        // --- CÁLCULO RFM PARA SEGMENTAÇÃO ---
        // (Nota: Usamos lógica similar ao getRfmAnalysis, mas retornando Strings para o filtro)
        let rfmStatus = 'Novos / Sem Dados';
        
        if (clientOrders.length > 0) {
            clientOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            const lastOrderDate = new Date(clientOrders[0].date);
            const daysSinceLastOrder = Math.floor((now.getTime() - lastOrderDate.getTime()) / (1000 * 3600 * 24));
            const totalSpent = clientOrders.reduce((acc, curr) => acc + curr.total, 0);
            const count = clientOrders.length;

            if (daysSinceLastOrder > 180) {
                rfmStatus = 'Hibernando';
            } else if (daysSinceLastOrder > 90) {
                rfmStatus = 'Em Risco';
            } else {
                if (totalSpent > 1000 || count > 3) rfmStatus = 'Champions';
                else if (count > 1) rfmStatus = 'Leais';
                else rfmStatus = 'Recentes';
            }
        }

        return {
            id: c.id,
            name: c.name,
            email: c.email,
            city: c.city,
            state: c.state,
            rfm: rfmStatus, // Campo usado pelo filtro 'rfm'
            has_android: extraData.has_android || false,
            gender: extraData.gender || 'Não informado',
            channels: extraData.channels || { email: true, whatsapp: false },
        };
    });
  }

  private formatEvents(events: any[]) {
    return events.map(e => ({
        event: e.eventType,
        client_id: e.customerId,
        context_id: (e.payload as any)?.context_id || null,
        date: e.createdAt.toISOString().split('T')[0],
        properties: e.payload as any || {}
    }));
  }

  private formatOrders(orders: any[]) {
    return orders.map(o => ({
        id: o.id,
        client_id: o.customerId,
        total: Number(o.totalValue),
        date: o.date.toISOString().split('T')[0],
        items: (o.items as any[])?.length || 0
    }));
  }

  private evaluateRuleEngine(db: any, blocks: any[]) {
    if (!blocks || blocks.length === 0) return { metrics: { total: 0 }, matchedClients: [] };

    const checkOp = (val: any, op: string, target: any) => {
        if (op === 'is_set') return val !== undefined && val !== null && val !== '';
        if (op === 'is_not_set') return val === undefined || val === null || val === '';
        
        const v = String(val ?? '').toLowerCase();
        const t = String(target ?? '').toLowerCase();
    
        if (op === 'greater_than' && target.includes('Últimos')) {
           const days = parseInt(target.replace(/\D/g, ''));
           const dateLimit = new Date();
           dateLimit.setDate(dateLimit.getDate() - days);
           const dateVal = new Date(val);
           return dateVal >= dateLimit;
        }
    
        switch (op) {
          case 'equals': return v === t;
          case 'not_equals': return v !== t;
          case 'contains': return v.includes(t);
          case 'not_contains': return !v.includes(t);
          case 'greater_than': return Number(val) > Number(target);
          case 'less_than': return Number(val) < Number(target);
          case 'is': return v === t;
          default: return false;
        }
    };

    const matchedClients = db.clients.filter((client: any) => {
        let globalResult: any = null;
    
        for (let i = 0; i < blocks.length; i++) {
          const block = blocks[i];
          let blockResult = false;
          
          // --- LOGICA DE FILTRO RFM ---
          if (block.category === 'rfm') {
             // Compara o status calculado (ex: "Champions") com o selecionado no dropdown
             blockResult = client.rfm === block.status;
          }
          else if (block.category === 'characteristic') {
            const clientVal = client[block.field];
            blockResult = checkOp(clientVal, block.operator, block.value);
          } 
          else if (block.category === 'segment_ref') {
            blockResult = false; // Futuro: Implementar recursão de segmentos
          }
          else if (block.category === 'behavioral') {
            let clientEvents = db.events.filter((e: any) => e.client_id === client.id && e.event === block.event);
    
            if (block.filters && block.filters.length > 0) {
              clientEvents = clientEvents.filter((ev: any) => {
                return block.filters.every((f: any) => {
                  const evVal = ev.properties[f.field] || (f.field === 'date' ? ev.date : undefined);
                  return checkOp(evVal, f.operator, f.value);
                });
              });
            }
    
            if (block.context === 'order') {
               blockResult = clientEvents.some((e: any) => e.context_id !== null);
            } else {
               blockResult = clientEvents.length > 0;
            }
    
            if (block.type === 'did_not') {
              blockResult = !blockResult;
            }
          }
    
          if (i === 0) {
            globalResult = blockResult;
          } else {
            if (block.logicOperator === 'OR') globalResult = globalResult || blockResult;
            else globalResult = globalResult && blockResult;
          }
        }
        return globalResult;
    });

    // Métricas
    const totalClients = matchedClients.length;
    const metrics = {
        total: totalClients,
        percent: db.clients.length > 0 ? ((totalClients / db.clients.length) * 100).toFixed(1) : 0,
        channels: {
          email: matchedClients.filter((c: any) => c.channels?.email).length,
          whatsapp: matchedClients.filter((c: any) => c.channels?.whatsapp).length,
        },
        revenue: {
          total: 0,
          buyers: 0,
          orders_count: 0
        }
      };
    
    const matchedIds = new Set(matchedClients.map((c: any) => c.id));
    const filteredOrders = db.orders.filter((o: any) => matchedIds.has(o.client_id));
      
    metrics.revenue.total = filteredOrders.reduce((acc: any, curr: any) => acc + curr.total, 0);
    metrics.revenue.orders_count = filteredOrders.length;
    metrics.revenue.buyers = new Set(filteredOrders.map((o: any) => o.client_id)).size;
    
    return { matchedClients: matchedClients.slice(0, 10), metrics };
  }

  // --- BUSCAR OPÇÕES DINÂMICAS DO BANCO ---
  async getFilterOptions() {
    // 1. Cidades e Estados (Isso é fácil, vem da tabela Customers)
    const citiesRaw = await this.prisma.customer.findMany({
      where: { city: { not: null } }, select: { city: true }, distinct: ['city'], orderBy: { city: 'asc' }
    });
    const statesRaw = await this.prisma.customer.findMany({
      where: { state: { not: null } }, select: { state: true }, distinct: ['state'], orderBy: { state: 'asc' }
    });

    const segmentsRaw = await this.prisma.segment.findMany({
        where: { active: true },
        select: { id: true, name: true },
        orderBy: { name: 'asc' }
    });

    // 2. Campanhas, Produtos e Categorias (Isso é difícil, está dentro de JSONs)
    // Solução: Pegamos uma amostra recente para varrer
    const recentEvents = await this.prisma.customerEvent.findMany({
      take: 2000, // Amostra segura
      orderBy: { createdAt: 'desc' },
      select: { payload: true }
    });

    const recentTransactions = await this.prisma.transaction.findMany({
      take: 1000,
      orderBy: { date: 'desc' },
      select: { items: true }
    });

    // Usamos SET para garantir valores únicos automaticamente
    const campaignsSet = new Set<string>();
    const categoriesSet = new Set<string>();
    const departmentsSet = new Set<string>();
    const productsSet = new Set<string>();
    const searchTermsSet = new Set<string>();

    // Varrer Eventos
    recentEvents.forEach(e => {
      const p = e.payload as any || {};
      if (p.campaign_id) campaignsSet.add(p.campaign_id);
      if (p.nome_categoria) categoriesSet.add(p.nome_categoria);
      if (p.nome_departamento) departmentsSet.add(p.nome_departamento);
      if (p.termo_busca) searchTermsSet.add(p.termo_busca);
      if (p.produto_id) productsSet.add(p.produto_id);
    });

    // Varrer Transações
    recentTransactions.forEach(t => {
      const items = (t.items as any[]) || [];
      items.forEach(item => {
        if (item.name) productsSet.add(item.name);
        if (item.category) categoriesSet.add(item.category);
        if (item.dept) departmentsSet.add(item.dept);
      });
    });

    return {
      cities: citiesRaw.map(c => c.city).filter(Boolean),
      states: statesRaw.map(s => s.state).filter(Boolean),
      segments: segmentsRaw,
      campaigns: Array.from(campaignsSet).sort(),
      categories: Array.from(categoriesSet).sort(),
      departments: Array.from(departmentsSet).sort(),
      products: Array.from(productsSet).sort(),
      search_terms: Array.from(searchTermsSet).sort(),
    };
  }

  // --- 1. LISTAR TODOS (COM DADOS DE AUDITORIA) ---
  async findAllSegments() {
    return this.prisma.segment.findMany({
      orderBy: { updatedAt: 'desc' }, // Ordena pela última edição
      include: {
        updatedBy: { // Traz o nome de quem mexeu
          select: { 
            name: true, 
            email: true 
          }
        }
      }
    });
  }

  // --- 2. BUSCAR UM ÚNICO (PARA A TELA DE EDIÇÃO) ---
  async getSegmentById(id: string) {
    const segment = await this.prisma.segment.findUnique({
      where: { id }
    });
    
    if (!segment) throw new Error('Segmento não encontrado');
    return segment;
  }

  // --- 3. ATUALIZAR SEGMENTO (SALVANDO QUEM MEXEU) ---
  async updateSegment(id: string, data: { name: string; rules: any; isDynamic: boolean }, userId?: string) {
    // Verifica se já existe outro segmento com esse nome (exceto ele mesmo)
    const existing = await this.prisma.segment.findFirst({
        where: { 
            name: { equals: data.name, mode: 'insensitive' },
            id: { not: id },
            // Se tiver loja: storeId: ...
        }
    });

    if (existing) throw new ConflictException('Já existe outro segmento com este nome.');

    return this.prisma.segment.update({
        where: { id },
        data: {
            name: data.name,
            rules: data.rules,
            isDynamic: data.isDynamic,
            // Grava o ID do usuário que fez a alteração (se fornecido)
            updatedById: userId 
        }
    });
  }

  // --- 4. TOGGLE STATUS ---
  async toggleSegmentStatus(id: string) {
    const segment = await this.prisma.segment.findUnique({ where: { id } });
    if (!segment) throw new Error('Segmento não encontrado');

    return this.prisma.segment.update({
      where: { id },
      data: { active: !segment.active }
    });
  }

  // --- 5. DELETAR ---
  async deleteSegment(id: string) {
    return this.prisma.segment.delete({
      where: { id }
    });
  }
}