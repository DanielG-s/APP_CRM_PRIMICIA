import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { SyncService } from 'src/modules/erp/sync/sync.service';

async function runSalesSync() {
    console.log('--- EXECUTANDO SINCRONIZAÇÃO DE VENDAS (HISTÓRICO) ---');
    const app = await NestFactory.createApplicationContext(AppModule);

    const syncService = app.get(SyncService);

    try {
        const startDateRaw = process.env.SYNC_START_DATE || '2025-12-14';
        const endDateRaw = process.env.SYNC_END_DATE || '2025-12-31';

        // As in syncController
        const startDate = new Date(startDateRaw);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(endDateRaw);
        endDate.setHours(23, 59, 59, 999);

        console.log(`\nIniciando sincronização de Vendas: ${startDate.toISOString()} → ${endDate.toISOString()}`);

        const result = await syncService.syncSales(startDate, endDate);

        console.log('\n✅ Sync de vendas finalizado com sucesso!');
        console.log('Resultado:', JSON.stringify(result, null, 2));

    } catch (err: any) {
        console.error('❌ Erro durante a sincronização de vendas:', err.message || err);
    } finally {
        await app.close();
    }
}

runSalesSync().catch(console.error);
