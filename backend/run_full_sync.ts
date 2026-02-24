import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { StoreSyncService } from './src/modules/erp/sync/store-sync.service';
import { ProductSyncService } from './src/modules/erp/sync/product-sync.service';
import { CustomerSyncService } from './src/modules/erp/sync/customer-sync.service';

async function runFullSync() {
    console.log('--- EXECUTANDO SINCRONIZAÇÃO COMPLETA (BASE DE DADOS) ---');
    const app = await NestFactory.createApplicationContext(AppModule);

    const storeSync = app.get(StoreSyncService);
    const productSync = app.get(ProductSyncService);
    const customerSync = app.get(CustomerSyncService);

    try {
        console.log('\n[1/3] Sincronizando Lojas (Filiais)...');
        await storeSync.syncStores();
        console.log('✅ Lojas sincronizadas com sucesso.');

        console.log('\n[2/3] Sincronizando Produtos...');
        await productSync.syncProducts();
        console.log('✅ Produtos sincronizados com sucesso.');

        console.log('\n[3/3] Sincronizando Clientes...');
        await customerSync.syncCustomers();
        console.log('✅ Clientes sincronizados com sucesso.');

        console.log('\n🎉 Sincronização completa finalizada.');
    } catch (err: any) {
        console.error('❌ Erro durante a sincronização:', err.message || err);
    } finally {
        await app.close();
    }
}

runFullSync().catch(console.error);
