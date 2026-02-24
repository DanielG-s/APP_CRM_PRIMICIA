import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { differenceInDays } from 'date-fns';

// Helper: Convert RFM Label to Numeric Score
function rfmLabelToScore(label: string): number {
  const scoreMap: Record<string, number> = {
    VIP: 95,
    Leal: 80,
    Leais: 80,
    Novo: 60,
    'Em Risco': 40,
    Inativo: 20,
    Lead: 5,
    Desconhecido: 0,
  };
  return scoreMap[label] || 0;
}

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) { }

  async findAll({
    page = 1,
    limit = 10,
    search = '',
    sortBy = 'createdAt',
    sortDir = 'desc',
    segments = [],
  }: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortDir?: string;
    segments?: string[];
  } = {}) {
    const offset = (page - 1) * limit;

    const sortFieldMap: Record<string, string> = {
      name: '"name"',
      rfmScore: '"rfmLabel"',
      campaignsCount: '"name"',
      totalTransactions: '"totalTransactions"',
      lastPurchase: '"lastPurchaseDate"',
      ltv: 'ltv',
      createdAt: '"createdAt"',
    };
    const orderField = sortFieldMap[sortBy] || '"createdAt"';
    const orderDir = sortDir.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const hasSegments = segments && segments.length > 0;

    const query = `
      WITH CustomerStats AS (
        SELECT 
          c.id, c.name, c.email, c.phone, c.cpf, c."createdAt",
          COALESCE(SUM(t."totalValue"), 0) as ltv,
          COUNT(t.id) as "totalTransactions",
          MAX(t.date) as "lastPurchaseDate",
          EXTRACT(EPOCH FROM (NOW() - MAX(t.date))) / 86400 as "daysSinceLastBuy"
        FROM "Customer" c
        LEFT JOIN "Transaction" t ON c.id = t."customerId"
        WHERE c.name ILIKE $1 OR c.email ILIKE $1 OR c.cpf ILIKE $1
        GROUP BY c.id
      ),
      CustomerWithRfm AS (
        SELECT *,
          CASE 
            WHEN "totalTransactions" = 0 THEN 'Lead'
            WHEN "daysSinceLastBuy" > 120 THEN 'Inativo'
            WHEN "daysSinceLastBuy" > 60 THEN 'Em Risco'
            WHEN ltv > 1000 AND "totalTransactions" > 3 THEN 'VIP'
            WHEN "totalTransactions" = 1 THEN 'Novo'
            ELSE 'Leal'
          END as "rfmLabel"
        FROM CustomerStats
      ),
      FilteredCustomers AS (
        SELECT *, COUNT(*) OVER() as "fullCount" 
        FROM CustomerWithRfm
        WHERE ($2::boolean = false OR "rfmLabel" = ANY($3::text[]))
      )
      SELECT * FROM FilteredCustomers
      ORDER BY ${orderField} ${orderDir}
      LIMIT $4 OFFSET $5
    `;

    const rawCustomers: any[] = await this.prisma.$queryRawUnsafe(
      query,
      `%${search}%`,
      hasSegments,
      hasSegments ? segments : [],
      limit,
      offset,
    );

    const total = rawCustomers.length > 0 ? Number(rawCustomers[0].fullCount) : 0;

    const data = rawCustomers.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email || 'Sem e-mail',
      phone: c.phone || 'Sem telefone',
      cpf: c.cpf || '',

      ltv: Number(c.ltv),
      lastPurchase: c.lastPurchaseDate ? c.lastPurchaseDate.toISOString() : null,
      daysSinceLastBuy: c.daysSinceLastBuy ? Math.floor(c.daysSinceLastBuy) : 9999,
      totalTransactions: Number(c.totalTransactions),
      status: c.daysSinceLastBuy > 120 ? 'inactive' : c.daysSinceLastBuy > 60 ? 'warning' : 'active',
      rfmLabel: c.rfmLabel,
      createdAt: c.createdAt,
      campaignsCount: 0,
      rfmScore: rfmLabelToScore(c.rfmLabel),
      recentTransactions: [],
    }));

    return {
      data,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        transactions: {
          select: {
            id: true,
            totalValue: true,
            date: true,
            channel: true,
            status: true,
            store: { select: { name: true, tradeName: true, code: true } },
          },
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!customer)
      throw new NotFoundException(`Customer with ID ${id} not found`);

    const today = new Date();
    const ltv = customer.transactions.reduce(
      (acc, curr) => acc + Number(curr.totalValue),
      0,
    );
    const totalTransactions = customer.transactions.length;
    let lastPurchaseDate: Date | null = null;
    let daysSinceLastBuy = 9999;

    if (totalTransactions > 0) {
      lastPurchaseDate = customer.transactions[0].date;
      daysSinceLastBuy = differenceInDays(today, lastPurchaseDate);
    }

    let rfmLabel = 'Desconhecido';
    if (totalTransactions === 0) rfmLabel = 'Lead';
    else if (daysSinceLastBuy > 120) rfmLabel = 'Inativo';
    else if (daysSinceLastBuy > 60) rfmLabel = 'Em Risco';
    else {
      if (ltv > 1000 && totalTransactions > 3) rfmLabel = 'VIP';
      else if (totalTransactions === 1) rfmLabel = 'Novo';
      else rfmLabel = 'Leal';
    }

    return {
      ...customer,
      ltv,
      totalTransactions,
      lastPurchaseDate,
      daysSinceLastBuy,
      rfmLabel,
      // Fields currently not in DB, returning null/0 to avoid hardcoding
      campaignsCount: 0,
      rfmScore: rfmLabelToScore(rfmLabel),
      propensityScore: null,
      propensityLabel: null, // Removed - not implemented yet
      age: customer.birthDate
        ? Math.floor(differenceInDays(today, customer.birthDate) / 365)
        : null,
      registrationDate: customer.createdAt,
      preferredStore: null, // TODO: Calculate from transactions
      history: customer.transactions.map((t) => {
        const isReturn = Number(t.totalValue) < 0 || t.status === 'REFUNDED';
        return {
          type: isReturn ? 'return' : 'purchase',
          date: t.date,
          description: isReturn ? 'Devolução Realizada' : 'Compra Realizada',
          value: Number(t.totalValue),
          meta: `Canal: ${t.channel || 'Loja'} `,
          store: t.store?.name || 'Loja Física',
          storeTradeName: t.store?.tradeName,
          storeCode: t.store?.code,
        };
      }),
      recentTransactions: customer.transactions.slice(0, 3).map((t) => ({
        id: t.id,
        date: t.date,
        value: Number(t.totalValue),
        status: t.status,
      })),
    };
  }
}
