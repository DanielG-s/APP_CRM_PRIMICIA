const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const c = await prisma.customer.findFirst({
        where: { transactions: { some: {} } },
        include: { transactions: true }
    });

    if (!c) {
        console.log("No customer with transactions");
        return;
    }

    const sum = c.transactions.reduce((acc, t) => acc + Number(t.totalValue), 0);
    console.log("On the fly sum:", sum);
    console.log("Pre-calculated totalSpent:", Number(c.totalSpent));
    console.log("Transaction count:", c.transactions.length);
    console.log("Pre-calculated ordersCount:", c.ordersCount);
    console.log("Pre-calculated rfmStatus:", c.rfmStatus);
    console.log("Pre-calculated lastOrderDate:", c.lastOrderDate);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
