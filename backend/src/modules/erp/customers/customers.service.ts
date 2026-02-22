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

  async findAll() {
    const customers = await this.prisma.customer.findMany({
      include: {
        transactions: {
          select: { id: true, totalValue: true, date: true, items: true },
          orderBy: { date: 'desc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    const today = new Date();

    return customers.map((customer) => {
      // Cálculos (mantidos)
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

      // Classificação (mantida)
      let rfmLabel = 'Desconhecido';
      let status = 'inactive';

      if (totalTransactions === 0) {
        rfmLabel = 'Lead';
      } else {
        if (daysSinceLastBuy > 120) {
          rfmLabel = 'Inativo';
          status = 'inactive';
        } else if (daysSinceLastBuy > 60) {
          rfmLabel = 'Em Risco';
          status = 'warning';
        } else {
          status = 'active';
          if (ltv > 1000 && totalTransactions > 3) rfmLabel = 'VIP';
          else if (totalTransactions === 1) rfmLabel = 'Novo';
          else rfmLabel = 'Leal';
        }
      }

      return {
        id: customer.id,
        name: customer.name,
        email: customer.email || 'Sem e-mail',
        phone: customer.phone || 'Sem telefone',
        cpf: customer.cpf || '',

        ltv: ltv,
        lastPurchase: lastPurchaseDate ? lastPurchaseDate.toISOString() : null,
        daysSinceLastBuy,
        totalTransactions,
        status,
        rfmLabel,
        createdAt: customer.createdAt,
        campaignsCount: 0, // TODO: Implement Campaigns Module
        rfmScore: rfmLabelToScore(rfmLabel),
        // --- NOVO: Histórico das últimas 5 compras para o Drawer ---
        recentTransactions: customer.transactions.slice(0, 5).map((t) => ({
          id: t.id,
          date: t.date,
          value: Number(t.totalValue),
          // items: t.items // Se quiser mostrar itens, descomente
        })),
      };
    });
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
            items: true,
            channel: true,
            status: true,
            store: { select: { name: true, tradeName: true, code: true } },
          },
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!customer) throw new NotFoundException(`Customer with ID ${id} not found`);

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
