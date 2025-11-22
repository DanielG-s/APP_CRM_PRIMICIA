import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    // Busca clientes e INCLUI as transações para somar o total gasto
    const customers = await this.prisma.customer.findMany({
      include: {
        transactions: {
          select: { totalValue: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Formata os dados para o Front-end
    return customers.map(customer => {
      // Calcula o total gasto somando as transações
      const totalGasto = customer.transactions.reduce((acc, curr) => {
        return acc + Number(curr.totalValue);
      }, 0);

      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        cpf: customer.cpf || 'Não informado',
        phone: customer.phone || 'Não informado',
        totalSpent: totalGasto, // O LTV calculado
        lastBuy: customer.transactions.length > 0 ? 'Recente' : 'Nunca'
      };
    });
  }
}