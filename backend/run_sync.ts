import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { PrismaService } from './src/prisma/prisma.service';
import { SyncService } from './src/modules/erp/sync/sync.service';

async function runSync() {
    console.log('--- CRIAR LOJA + SYNC ERP ---');
    const app = await NestFactory.createApplicationContext(AppModule);
    const prisma = app.get(PrismaService);
    const syncService = app.get(SyncService);

    try {
        // 1. Buscar Org
        const org = await prisma.organization.findFirst();
        if (!org) { console.error('Org não encontrada!'); return; }
        console.log(`Organização: ${org.name} (${org.id})`);

        // 2. Criar Store (se não existir)
        let store = await (prisma.store as any).findFirst({ where: { organizationId: org.id } });
        if (!store) {
            store = await (prisma.store as any).create({
                data: {
                    organizationId: org.id,
                    name: 'Primicia',
                    tradeName: 'Primicia',
                    code: '1',
                    isActive: true,
                    syncEnabled: true,
                }
            });
            console.log(`Loja criada: ${store.name} (${store.id})`);
        } else {
            console.log(`Loja existente: ${store.name} (${store.id})`);
        }

        // 3. Vincular users à loja (opcional)
        await prisma.user.updateMany({
            where: { organizationId: org.id, storeId: null },
            data: { storeId: store.id },
        });
        console.log('Usuários vinculados à loja.');

        // 4. Rodar Sync direto (sem BullMQ)
        const startDate = new Date(process.env.SYNC_START_DATE || '2025-12-14');
        const endDate = new Date(process.env.SYNC_END_DATE || '2025-12-31');
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        console.log(`\nIniciando sincronização: ${startDate.toISOString()} → ${endDate.toISOString()}`);
        const result = await syncService.syncSales(startDate, endDate);
        console.log('Resultado:', JSON.stringify(result, null, 2));

        console.log('\n✅ Sync completo!');
    } catch (err: any) {
        console.error('Erro:', err.message || err);
    } finally {
        await app.close();
    }
}

runSync().catch(console.error);
