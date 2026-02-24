import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class RetailMetricsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMetrics(start: Date, end: Date, storeIds?: string[]) {
    const where: Prisma.TransactionWhereInput = {
      date: {
        gte: start,
        lte: end,
      },
      status: 'PAID', // Only count paid transactions
    };

    if (storeIds && storeIds.length > 0) {
      where.storeId = { in: storeIds };
    }

    // 1. Basic Aggregations (Revenue, Orders)
    const aggregates = await this.prisma.transaction.aggregate({
      where,
      _sum: {
        totalValue: true,
      },
      _count: {
        id: true,
        customerId: true, // Unique customers? No, this counts transactions.
      },
    });

    const totalRevenue = Number(aggregates._sum.totalValue) || 0;
    const totalOrders = aggregates._count.id || 0;
    const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // 2. Active Customers (Distinct Count)
    // Prisma doesn't support distinct count in aggregate easily, so we group by customerId
    const distinctCustomers = await this.prisma.transaction.groupBy({
      by: ['customerId'],
      where,
    });
    const activeCustomers = distinctCustomers.length;

    // 3. Recurrence Rate (Customers with > 1 order in period)
    // Note: Recurrence is usually calculated over a longer period (Verified Customer Base),
    // but here we calculate "Repeat Buyers in Period".
    // Better metric: % of active customers who are RETURNING (have bought before).
    // For now, let's Stick to "Frequency in Period > 1".

    // We can count from the groupBy result efficiently in memory since it's an array of { customerId }.
    // Wait, groupBy doesn't return count per group unless we ask.
    const customersWithCounts = await this.prisma.transaction.groupBy({
      by: ['customerId'],
      where,
      _count: {
        id: true,
      },
    });

    const recurringCustomers = customersWithCounts.filter(
      (c) => c._count.id > 1,
    ).length;
    const repurchaseRate =
      activeCustomers > 0 ? (recurringCustomers / activeCustomers) * 100 : 0;

    // 4. Stores List (for filter)
    const stores = await this.prisma.store.findMany({
      select: { id: true, name: true },
    });

    return {
      overview: {
        revenue: totalRevenue,
        orders: totalOrders,
        avgTicket: avgTicket,
        activeCustomers: activeCustomers,
        repurchaseRate: repurchaseRate,
      },
      chartData: {
        // Implement time-series later if needed
      },
      stores: stores,
    };
  }
}
