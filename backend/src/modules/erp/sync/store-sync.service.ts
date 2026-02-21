import { Injectable, Logger } from '@nestjs/common';
import { MilleniumService } from '../millenium/millenium.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class StoreSyncService {
    private readonly logger = new Logger(StoreSyncService.name);

    constructor(
        private readonly milleniumService: MilleniumService,
        private readonly prisma: PrismaService,
        @InjectQueue('erp-sync-queue') private readonly syncQueue: Queue,
    ) { }

    @Cron('0 2 * * *') // Runs at 2:00 AM every day
    async handleDailySync() {
        this.logger.log('Queueing Daily Store (Filial) Sync...');

        const today = new Date().toISOString().split('T')[0];
        const customJobId = `sync-stores:global:${today}`;

        // Just one global job to sync all stores, no need to stagger per tenant
        // since we are fetching a global list and updating the global stores table.
        await this.syncQueue.add('sync-stores', {}, {
            jobId: customJobId,
            attempts: 3,
            backoff: { type: 'exponential', delay: 30000 },
            removeOnComplete: { age: 24 * 3600, count: 100 },
            removeOnFail: { age: 7 * 24 * 3600, count: 500 }
        });
    }

    async syncStores() {
        try {
            this.logger.log(`Syncing stores (filiais) from ERP...`);

            const filiais = await this.milleniumService.getFiliais();

            if (!filiais || filiais.length === 0) {
                this.logger.warn('No stores found in the ERP.');
                return;
            }

            this.logger.log(`Fetched ${filiais.length} total stores. Filtering...`);

            let updatedCount = 0;

            for (const raw of filiais) {
                // Ensure cod_filial exists
                if (!raw.cod_filial || !raw.nome) continue;

                const codFilial = String(raw.cod_filial).trim().toUpperCase();

                // Rule: Ignore stores starting with "DESAT-" or "DIV-"
                // Using regex or simple startsWith checking for specific prefixes
                if (codFilial.startsWith('DESAT-') || codFilial.startsWith('DIV-')) {
                    this.logger.debug(`Ignoring store ${raw.nome} due to prefix: ${codFilial}`);
                    continue;
                }

                // If any generic alphabetical prefix + dash is required to be ignored:
                // Uncomment if needed: if (/^[A-Z]+-/.test(codFilial)) continue;

                const storeName = raw.nome.trim();

                const storeData = {
                    name: storeName,
                    cnpj: raw.cnpj ? String(raw.cnpj).trim() : null,
                    isActive: true, // We assume if it came in the list and not excluded, it is active
                    // other fields could be mapped here if added to schema
                };

                // As Store doesn't have @unique on name in schema, we find first then update/create
                // This ensures we relate the sale.nome_emissor to this exact name.
                const existingStore = await this.prisma.store.findFirst({
                    where: { name: storeName }
                });

                if (existingStore) {
                    await this.prisma.store.update({
                        where: { id: existingStore.id },
                        data: storeData
                    });
                } else {
                    await this.prisma.store.create({
                        data: {
                            ...storeData,
                            syncEnabled: true
                        }
                    });
                }

                updatedCount++;
            }

            this.logger.log(`Store Sync Finished. Processed and active stores updated: ${updatedCount}`);

        } catch (error) {
            this.logger.error(`Store Sync Failed: ${error.message}`, error.stack);
            throw error;
        }
    }
}
