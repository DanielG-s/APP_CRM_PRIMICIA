import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
    const inactiveStores = await prisma.store.findMany({
        where: { isActive: false }
    });
    console.log('Found ' + inactiveStores.length + ' inactive stores to delete.');

    try {
        // Delete relationships
        const storeIds = inactiveStores.map(s => s.id);

        await prisma.transaction.deleteMany({ where: { storeId: { in: storeIds } } });
        await prisma.customer.deleteMany({ where: { storeId: { in: storeIds } } });
        await prisma.emailSettings.deleteMany({ where: { storeId: { in: storeIds } } });
        await prisma.storeWhatsappNumber.deleteMany({ where: { storeId: { in: storeIds } } });
        await prisma.storeGoal.deleteMany({ where: { storeId: { in: storeIds } } });
        await prisma.segment.deleteMany({ where: { storeId: { in: storeIds } } });
        await prisma.campaign.deleteMany({ where: { storeId: { in: storeIds } } });
        await prisma.user.deleteMany({ where: { storeId: { in: storeIds } } });

        const res = await prisma.store.deleteMany({
            where: { isActive: false }
        });
        console.log('Deleted ' + res.count + ' stores successfully.');
    } catch (e: any) {
        console.error('Error deleting:', e.message);
    }
}

run().then(() => process.exit(0));
