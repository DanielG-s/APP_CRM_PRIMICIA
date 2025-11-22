import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class IntelligenceService {
  constructor(private prisma: PrismaService) {}

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
      // (Ordena as datas e pega a mais recente)
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
}