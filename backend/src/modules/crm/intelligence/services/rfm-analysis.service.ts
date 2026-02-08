import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CRM_CONFIG } from 'src/config/crm.config';
import { Prisma } from '@prisma/client';

@Injectable()
export class RfmAnalysisService {
  constructor(private prisma: PrismaService) { }

  async getAnalysis() {
    const groups = await this.prisma.customer.groupBy({
      by: ['rfmStatus'],
      _count: { id: true },
    });

    const resultMap: Record<string, { value: number; color: string }> = {
      Champions: { value: 0, color: '#10b981' },
      Leais: { value: 0, color: '#3b82f6' },
      Recentes: { value: 0, color: '#6366f1' },
      'Em Risco': { value: 0, color: '#f59e0b' },
      Hibernando: { value: 0, color: '#ef4444' },
      'Novos / Sem Dados': { value: 0, color: '#9ca3af' },
    };

    groups.forEach((g) => {
      const key = g.rfmStatus || 'Novos / Sem Dados';
      let mapKey = key;

      if (key.includes('Champions')) mapKey = 'Champions';
      if (key.includes('Leais')) mapKey = 'Leais';
      if (key.includes('Recentes')) mapKey = 'Recentes';
      if (key.includes('Risco')) mapKey = 'Em Risco';
      if (key.includes('Hibernando')) mapKey = 'Hibernando';

      if (resultMap[mapKey] && g._count) {
        resultMap[mapKey].value += (g._count as { id: number }).id || 0;
      }
    });

    return Object.keys(resultMap).map((k) => ({
      name: k,
      value: resultMap[k].value,
      color: resultMap[k].color,
    }));
  }

  async updateCustomerMetrics(customerId: string) {
    const aggregates = await this.prisma.transaction.aggregate({
      where: { customerId },
      _sum: { totalValue: true },
      _count: { id: true },
      _max: { date: true },
    });

    const totalSpent = Number(aggregates._sum.totalValue || 0);
    const ordersCount = aggregates._count.id || 0;
    const lastOrderDate = aggregates._max.date;

    let rfmStatus = 'Novos / Sem Dados';

    if (ordersCount > 0 && lastOrderDate) {
      const daysSince = Math.floor(
        (new Date().getTime() - lastOrderDate.getTime()) / (1000 * 3600 * 24),
      );

      if (daysSince > CRM_CONFIG.RFM.CHURN_DAYS) rfmStatus = 'Hibernando';
      else if (daysSince > CRM_CONFIG.RFM.RISK_DAYS) rfmStatus = 'Em Risco';
      else if (
        totalSpent > CRM_CONFIG.RFM.LOYAL_TOTAL_SPENT ||
        ordersCount > CRM_CONFIG.RFM.LOYAL_ORDER_COUNT
      )
        rfmStatus = 'Champions';
      else if (ordersCount > CRM_CONFIG.RFM.MIN_ORDERS_FOR_LOYALTY)
        rfmStatus = 'Leais';
      else rfmStatus = 'Recentes';
    }

    await this.prisma.customer.update({
      where: { id: customerId },
      data: {
        totalSpent: new Prisma.Decimal(totalSpent),
        ordersCount,
        lastOrderDate,
        rfmStatus,
      },
    });
  }
}
