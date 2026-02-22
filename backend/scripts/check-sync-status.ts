import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
    try {
        const count = await prisma.transaction.count();
        console.log('COUNT:' + count);

        const stores = await (prisma.store as any).findMany({
            where: { code: { in: ['007', '004', '008'] } },
            include: { _count: { select: { transactions: true } } }
        });

        console.log('SAMPLES:');
        stores.forEach((s: any) => {
            console.log(s.code + ': ' + s._count.transactions + ' txs');
        });
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

run();
