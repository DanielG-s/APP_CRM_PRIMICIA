import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { differenceInDays } from 'date-fns'; 

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

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
      const ltv = customer.transactions.reduce((acc, curr) => acc + Number(curr.totalValue), 0);
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
        if (daysSinceLastBuy > 120) { rfmLabel = 'Inativo'; status = 'inactive'; } 
        else if (daysSinceLastBuy > 60) { rfmLabel = 'Em Risco'; status = 'warning'; } 
        else {
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

        // --- NOVO: Histórico das últimas 5 compras para o Drawer ---
        recentTransactions: customer.transactions.slice(0, 5).map(t => ({
            id: t.id,
            date: t.date,
            value: Number(t.totalValue),
            // items: t.items // Se quiser mostrar itens, descomente
        }))
      };
    });
  }
}