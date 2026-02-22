import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SegmentationQueryBuilder } from './services/segmentation-query.builder';
import { RfmAnalysisService } from './services/rfm-analysis.service';
import { DataExportService } from './services/data-export.service';

interface TransactionItem {
  name?: string;
  category?: string;
}

@Injectable()
export class IntelligenceService {
  constructor(
    private prisma: PrismaService,
    private queryBuilder: SegmentationQueryBuilder,
    private rfmService: RfmAnalysisService,
    private exportService: DataExportService,
  ) { }

  // ===========================================================================
  // 1. DASHBOARD RFM
  // ===========================================================================
  /**
   * Retrieves the current RFM analysis.
   * Delegates to RfmAnalysisService.
   * @returns {Promise<any>} The RFM analysis data.
   */
  async getRfmAnalysis() {
    return this.rfmService.getAnalysis();
  }

  // ===========================================================================
  // 2. ENGINE DE CÁLCULO REAL
  // ===========================================================================
  /**
   * Calculates a preview of customer metrics based on segmentation rules.
   * Returns total count, revenue stats, and a list of sample clients.
   *
   * @param rules Array of segmentation rules (e.g., filters by state, city, spend).
   * @returns {Promise<{metrics: any, matchedClients: any[]}>} Preview data.
   */
  async calculatePreview(rules: any[]) {
    const whereClause = this.queryBuilder.build(rules);

    const totalClients = await this.prisma.customer.count({
      where: whereClause,
    });
    const totalDatabase = await this.prisma.customer.count();

    const matchedClients = await this.prisma.customer.findMany({
      where: whereClause,
      take: 10,
      select: {
        id: true,
        name: true,
        email: true,
        city: true,
        state: true,
        rfmStatus: true,
      },
    });

    const aggregates = await this.prisma.customer.aggregate({
      where: whereClause,
      _sum: { totalSpent: true },
      _count: { id: true },
    });

    const channelCounts = await this.prisma.customer.aggregate({
      where: whereClause,
      _count: {
        email: true,
        phone: true,
      },
    });

    return {
      metrics: {
        total: totalClients,
        percent:
          totalDatabase > 0
            ? ((totalClients / totalDatabase) * 100).toFixed(1)
            : 0,
        revenue: {
          total: Number(aggregates._sum.totalSpent || 0),
          buyers: aggregates._count.id,
          orders_count: 0,
        },
        channels: {
          email: channelCounts._count.email || 0,
          whatsapp: channelCounts._count.phone || 0,
        },
      },
      matchedClients: matchedClients.map((c) => ({
        ...c,
        rfm: c.rfmStatus || 'Novos / Sem Dados',
      })),
    };
  }

  // ===========================================================================
  // 3. MANUTENÇÃO AUTOMÁTICA (CRON JOB)
  // ===========================================================================

  /**
   * CRON JOB: Runs everyday at 3 AM.
   * Takes a snapshot of customer counts for all active segments.
   * Stores history in SegmentHistory table and updates lastCount.
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleDailySegmentSnapshot() {
    console.log('📸 Iniciando snapshot diário dos segmentos...');

    const segments = await this.prisma.segment.findMany({
      where: { active: true },
    });

    for (const seg of segments) {
      try {
        const whereClause = this.queryBuilder.build(
          (seg.rules as unknown as any[]) || [],
        );
        const currentCount = await this.prisma.customer.count({
          where: whereClause,
        });

        await this.prisma.segmentHistory.create({
          data: {
            segmentId: seg.id,
            count: currentCount,
            date: new Date(),
          },
        });

        await this.prisma.segment.update({
          where: { id: seg.id },
          data: { lastCount: currentCount },
        });
      } catch (error) {
        console.error(
          `Erro ao processar snapshot do segmento ${seg.name}:`,
          error,
        );
      }
    }
    console.log('✅ Snapshot diário concluído.');
  }

  // Método unificado para listagem com tendência
  /**
   * Lists all segments with their trend analysis (growth/shrinkage compared to last snapshot).
   * @returns {Promise<{segments: any[], totalCustomers: number}>} List of segments with metrics.
   */
  async findAllSegmentsWithTrend() {
    const totalCustomers = await this.prisma.customer.count();

    const segments = await this.prisma.segment.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        updatedBy: { select: { name: true, email: true } },
        history: {
          orderBy: { date: 'desc' },
          take: 1,
          skip: 1,
        },
      },
    });

    const formattedSegments = segments.map((seg) => {
      const currentCount = seg.lastCount;
      const previousCount = seg.history[0]?.count || currentCount;

      let trendPercent = 0;
      if (previousCount > 0) {
        trendPercent = ((currentCount - previousCount) / previousCount) * 100;
      }

      return {
        ...seg,
        metrics: {
          totalBase: totalCustomers,
          reachPercent:
            totalCustomers > 0
              ? ((currentCount / totalCustomers) * 100).toFixed(1)
              : 0,
          trend: trendPercent.toFixed(1),
        },
      };
    });

    return { segments: formattedSegments, totalCustomers };
  }

  // ===========================================================================
  // 4. CRUD
  // ===========================================================================

  /**
   * Creates a new Customer Segment.
   *
   * @param data.name Name of the segment.
   * @param data.rules Rules definition (JSON).
   * @param data.isDynamic Whether the segment updates automatically.
   * @throws {ConflictException} If a segment with the same name already exists.
   */
  async createSegment(data: { name: string; rules: any; isDynamic: boolean }) {
    const store = await this.prisma.store.findFirst();
    const existingSegment = await this.prisma.segment.findFirst({
      where: {
        name: { equals: data.name, mode: 'insensitive' },
        storeId: store?.id,
      },
    });

    if (existingSegment)
      throw new ConflictException('Já existe um segmento com este nome.');

    const whereClause = this.queryBuilder.build(data.rules as any[]);
    const count = await this.prisma.customer.count({ where: whereClause });

    return this.prisma.segment.create({
      data: {
        name: data.name,
        rules: data.rules,
        logic: 'custom',
        active: true,
        organizationId: store?.organizationId || 'default',
        storeId: store?.id || 'default',
        isDynamic: data.isDynamic,
        lastCount: count,
      },
    });
  }

  async updateSegment(
    id: string,
    data: { name: string; rules: any; isDynamic: boolean },
    userId?: string,
  ) {
    const existing = await this.prisma.segment.findFirst({
      where: {
        name: { equals: data.name, mode: 'insensitive' },
        id: { not: id },
      },
    });
    if (existing)
      throw new ConflictException('Já existe outro segmento com este nome.');

    const whereClause = this.queryBuilder.build(data.rules as any[]);
    const count = await this.prisma.customer.count({ where: whereClause });

    return this.prisma.segment.update({
      where: { id },
      data: {
        name: data.name,
        rules: data.rules,
        isDynamic: data.isDynamic,
        updatedById: userId,
        lastCount: count,
      },
    });
  }

  // ===========================================================================
  // 5. MÉTODOS AUXILIARES
  // ===========================================================================

  /**
   * Retrieves available options for filtering (Cities, States, Products, etc.).
   * Used to populate UI select inputs.
   */
  async getFilterOptions() {
    const citiesRaw = await this.prisma.customer.findMany({
      where: { city: { not: null } },
      select: { city: true },
      distinct: ['city'],
      orderBy: { city: 'asc' },
    });
    const statesRaw = await this.prisma.customer.findMany({
      where: { state: { not: null } },
      select: { state: true },
      distinct: ['state'],
      orderBy: { state: 'asc' },
    });

    const segmentsRaw = await this.prisma.segment.findMany({
      where: { active: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });

    const recentTransactions = await this.prisma.transaction.findMany({
      take: 1000,
      orderBy: { date: 'desc' },
      select: { items: true },
    });

    const categoriesSet = new Set<string>();
    const productsSet = new Set<string>();

    interface TransactionItem {
      name?: string;
      category?: string;
    }

    recentTransactions.forEach((t) => {
      const items = (t.items as unknown as TransactionItem[]) || [];
      items.forEach((item) => {
        if (item.name) productsSet.add(item.name);
        if (item.category) categoriesSet.add(item.category);
      });
    });

    return {
      cities: citiesRaw.map((c) => c.city).filter(Boolean),
      states: statesRaw.map((s) => s.state).filter(Boolean),
      segments: segmentsRaw,
      products: Array.from(productsSet).sort(),
      categories: Array.from(categoriesSet).sort(),
      campaigns: [],
      departments: [],
      search_terms: [],
    };
  }

  async findAllSegments() {
    return this.findAllSegmentsWithTrend();
  }

  getSegmentationData() {
    return { clients: [], events: [], orders: [] };
  }

  async getSegmentById(id: string) {
    const segment = await this.prisma.segment.findUnique({ where: { id } });
    if (!segment) throw new Error('Segmento não encontrado');
    return segment;
  }

  async toggleSegmentStatus(id: string) {
    const s = await this.prisma.segment.findUnique({ where: { id } });
    if (!s) throw new Error('Segmento não encontrado');
    return this.prisma.segment.update({
      where: { id },
      data: { active: !s.active },
    });
  }

  async deleteSegment(id: string) {
    return this.prisma.segment.delete({ where: { id } });
  }

  async updateCustomerMetrics(customerId: string) {
    return this.rfmService.updateCustomerMetrics(customerId);
  }

  // Legacy method removed/merged into handleDailySegmentSnapshot
  // async handleDailyUpdate() { ... }

  async exportSegmentToCsv(segmentId: string): Promise<string> {
    return this.exportService.exportSegmentToCsv(segmentId);
  }
}
