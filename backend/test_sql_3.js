const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const search = '';
    const segments = [];
    const limit = 10;
    const offset = 0;
    const hasSegments = segments.length > 0;

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
    ORDER BY "createdAt" DESC
    LIMIT $4 OFFSET $5
  `;

    console.time('SQL');
    const res = await prisma.$queryRawUnsafe(query, `%${search}%`, hasSegments, segments, limit, offset);
    console.timeEnd('SQL');

    console.log("Found:", res.length);
    if (res.length > 0) console.log(res[0]);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
