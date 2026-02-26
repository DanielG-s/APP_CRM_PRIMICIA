const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.time('Prisma findMany (Current)');
    const customers = await prisma.customer.findMany({
        include: {
            transactions: {
                select: { id: true, totalValue: true, date: true },
                orderBy: { date: 'desc' },
            },
        },
        orderBy: { name: 'asc' },
    });
    console.timeEnd('Prisma findMany (Current)');

    console.time('Raw SQL Aggregation (Proposed)');
    const rawClients = await prisma.$queryRaw`
    SELECT 
      c.id, c.name, c.email, c.phone, c.cpf, c."createdAt",
      COALESCE(SUM(t."totalValue"), 0) as ltv,
      COUNT(t.id) as "totalTransactions",
      MAX(t.date) as "lastPurchaseDate"
    FROM "Customer" c
    LEFT JOIN "Transaction" t ON c.id = t."customerId"
    GROUP BY c.id
    ORDER BY c.name ASC
  `;
    console.timeEnd('Raw SQL Aggregation (Proposed)');

    console.log("Found", rawClients.length, "clients.");
    if (rawClients.length > 0) {
        console.log("Sample:", rawClients[0]);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
