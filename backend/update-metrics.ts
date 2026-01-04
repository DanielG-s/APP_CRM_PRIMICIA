// ARQUIVO: backend/update-metrics.ts

import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Iniciando cálculo de métricas para clientes existentes...");
  
  // 1. Busca todos os IDs de clientes
  const customers = await prisma.customer.findMany({ 
    select: { id: true, name: true } 
  });
  
  console.log(`📊 Encontrados ${customers.length} clientes para processar.`);

  let processed = 0;
  const startTotal = Date.now();

  for (const customer of customers) {
    // 2. Agrega dados das transações do cliente
    const aggregates = await prisma.transaction.aggregate({
        where: { customerId: customer.id },
        _sum: { totalValue: true },
        _count: { id: true },
        _max: { date: true }
    });

    const totalSpent = Number(aggregates._sum.totalValue || 0);
    const ordersCount = aggregates._count.id || 0;
    const lastOrderDate = aggregates._max.date;

    // 3. Lógica RFM (Idêntica ao Service)
    let rfmStatus = 'Novos / Sem Dados';
    
    if (ordersCount > 0 && lastOrderDate) {
        const daysSince = Math.floor((new Date().getTime() - lastOrderDate.getTime()) / (1000 * 3600 * 24));
        
        if (daysSince > 180) {
            rfmStatus = 'Hibernando';
        } else if (daysSince > 90) {
            rfmStatus = 'Em Risco';
        } else {
            // Clientes recentes/ativos
            if (totalSpent > 1000 || ordersCount > 5) {
                rfmStatus = 'Champions';
            } else if (ordersCount > 1) {
                rfmStatus = 'Leais';
            } else {
                rfmStatus = 'Recentes';
            }
        }
    }

    // 4. Salva no Cache do Cliente
    await prisma.customer.update({
        where: { id: customer.id },
        data: {
            totalSpent: new Prisma.Decimal(totalSpent),
            ordersCount: ordersCount,
            lastOrderDate: lastOrderDate,
            rfmStatus: rfmStatus
        }
    });

    processed++;
    if (processed % 50 === 0) {
        console.log(`✅ Processados: ${processed}/${customers.length} clientes...`);
    }
  }

  const duration = ((Date.now() - startTotal) / 1000).toFixed(2);
  console.log(`\n🏁 Concluído com sucesso em ${duration}s!`);
  console.log(`Agora seus filtros de segmento funcionarão em tempo real.`);
}

main()
  .catch((e) => {
    console.error("❌ Erro ao rodar script:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });