
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Verifying Data Quality & Returns ---');

    // 1. Check for Correct Dates (2025)
    const correctTransactions = await prisma.transaction.findMany({
        take: 5,
        where: {
            date: {
                lt: new Date('2026-01-01')
            }
        },
        orderBy: { date: 'desc' },
        include: { customer: true, store: true }
    });

    console.log(`\nFound ${correctTransactions.length} transactions in 2025 (Correct Chronology):`);
    correctTransactions.forEach((t: any) => {
        console.log(`ID: ${t.id}`);
        console.log(`  Date: ${t.date.toISOString()}`);
        console.log(`  Value: ${t.totalValue}`);
        console.log(`  Status: ${t.status}`);
        console.log(`  Customer: ${t.customer?.name}`);
        console.log(`  Store: ${t.store?.name}`);
        console.log('---');
    });

    // 2. Check for Negative Values (Returns)
    const returns = await prisma.transaction.findMany({
        where: {
            totalValue: { lt: 0 }
        },
        take: 5
    });

    console.log(`\nReturns Found: ${returns.length}`);
    returns.forEach((t: any) => {
        console.log(`[RETURN] ID: ${t.id} | Value: ${t.totalValue} | Status: ${t.status} | Date: ${t.date.toISOString()}`);
    });

    // 3. Check Customer Address Enrichment
    const enrichedCustomers = await prisma.customer.count({
        where: {
            AND: [
                { address: { not: null } },
                { city: { not: null } }
            ]
        }
    });
    console.log(`\nCustomers with Enriched Address: ${enrichedCustomers}`);

    // 4. Check Null Emails
    const nullEmailCount = await prisma.customer.count({
        where: { email: null }
    });
    const placeholderEmailCount = await prisma.customer.count({
        where: { email: { contains: 'nomail_' } }
    });

    console.log(`\nCustomers with NULL Email: ${nullEmailCount}`);
    console.log(`Customers with Placeholder Email (nomail_): ${placeholderEmailCount}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
