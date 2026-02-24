import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';

(async () => {
    const app = await NestFactory.createApplicationContext(AppModule);
    const prisma = app.get(PrismaService);

    console.log('--- WIPE DB (Excluding Users & Orgs) ---');

    // Order matters for foreign keys
    await prisma.transaction.deleteMany();
    await prisma.product.deleteMany();
    await prisma.campaignMetric.deleteMany();
    await prisma.campaignSchedule.deleteMany();
    await prisma.campaign.deleteMany();
    await prisma.segmentHistory.deleteMany();
    await prisma.segment.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.storeWhatsappNumber.deleteMany();
    await prisma.storeGoal.deleteMany();
    await prisma.accessLog.deleteMany();

    // Remove users from store so we can delete stores
    await prisma.user.updateMany({
        data: { storeId: null }
    });

    await prisma.store.deleteMany();

    console.log('Database cleaned successfully.');
    await app.close();
})();
