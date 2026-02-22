import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { StoreSyncService } from '../src/modules/erp/sync/store-sync.service';
import { SyncService } from '../src/modules/erp/sync/sync.service';
import { subDays } from 'date-fns';

async function bootstrap() {
    console.log('--- Reseting Stores and Sales ---');
    const app = await NestFactory.createApplicationContext(AppModule);
    const prisma = app.get(PrismaService);
    const storeSync = app.get(StoreSyncService);
    const syncService = app.get(SyncService);

    console.log('Deleting all current transactions...');
    await prisma.transaction.deleteMany({});

    console.log('Disabling old stores to avoid conflicts...');
    const stores = await prisma.store.findMany();
    for (const st of stores) {
        await prisma.store.update({
            where: { id: st.id },
            data: {
                code: null,
                name: `DELETED_${st.id.substring(0, 6)}`,
                isActive: false
            }
        });
    }

    console.log('Forcing Store Sync...');
    await storeSync.syncStores();

    console.log('Forcing Sales Sync for the last 15 days...');
    const end = new Date();
    const start = subDays(new Date(), 15);
    await syncService.syncSales(start, end);

    console.log('--- Done ---');
    await app.close();
    process.exit(0);
}

bootstrap();
