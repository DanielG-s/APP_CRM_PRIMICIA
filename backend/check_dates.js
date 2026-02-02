
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
    const tx = await prisma.transaction.findMany({
        take: 5,
        orderBy: { date: 'desc' },
        select: { id: true, date: true, totalValue: true }
    });
    console.log(JSON.stringify(tx, null, 2));
}
run();
