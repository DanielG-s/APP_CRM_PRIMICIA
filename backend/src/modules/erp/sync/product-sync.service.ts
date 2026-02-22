import { Injectable, Logger } from '@nestjs/common';
import { MilleniumService } from '../millenium/millenium.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class ProductSyncService {
  private readonly logger = new Logger(ProductSyncService.name);

  constructor(
    private readonly milleniumService: MilleniumService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    @InjectQueue('erp-sync-queue') private readonly syncQueue: Queue,
  ) { }

  @Cron('0 4 * * *') // Runs at 4:00 AM every day
  async handleDailySync() {
    const today = new Date().toISOString().split('T')[0];

    let skip = 0;
    const take = 100;
    let hasMore = true;
    let queueIndex = 0;

    // B-Audit: Configurable fairness jitter and max cap
    const delayStepMs = Number(
      this.configService.get('ERP_SYNC_DELAY_PRODUCTS_MS_STEP', 300000),
    ); // Default 5 mins
    const maxDelayMs = Number(
      this.configService.get('ERP_SYNC_DELAY_PRODUCTS_MS_MAX', 7200000),
    ); // Default 2 hours cap

    while (hasMore) {
      // Fetch active stores only, ordered for determinism and fairness
      const stores = await this.prisma.store.findMany({
        where: { isActive: true },
        orderBy: { id: 'asc' },
        select: { id: true, name: true },
        take,
        skip,
      });

      if (!stores.length) {
        hasMore = false;
        break;
      }

      for (const store of stores) {
        const tenantId = store.id;
        // Idempotency: Predictable Job ID based on tenant + date
        const customJobId = `sync-products:${tenantId}:${today}`;

        // Fairness: Hash based delay distribution across the 2h window to avoid bursts + Jitter
        const hash = Array.from(tenantId).reduce(
          (acc, char) => acc + char.charCodeAt(0),
          0,
        );
        const baseDelay = hash % maxDelayMs;
        const jitter = Math.floor(Math.random() * 15000); // 0-15s random jitter
        const delay = baseDelay + jitter;

        this.logger.log(
          `Queueing Daily Product Sync for ${store.name} (Tenant: ${tenantId}) with ${delay / 1000}s delay. JobId: ${customJobId}`,
        );

        await this.syncQueue.add(
          'sync-products',
          { tenantId },
          {
            jobId: customJobId,
            delay: delay,
            attempts: 3,
            backoff: { type: 'exponential', delay: 60000 }, // 1 min, 2 min, 4 min
            removeOnComplete: { age: 24 * 3600, count: 100 }, // Retention policy complete
            removeOnFail: { age: 7 * 24 * 3600, count: 500 }, // Retention policy failed
          },
        );

        queueIndex++;
      }

      skip += take;
    }
  }

  async syncProducts() {
    try {
      const batchSize = 1000;
      let skip = 0;
      let hasMore = true;
      let updatedCount = 0;

      const defaultOrg = await this.prisma.organization.findFirst();
      const defaultOrgId = defaultOrg?.id || 'default';

      this.logger.log(`Syncing products from ERP (BatchSize: ${batchSize})`);

      while (hasMore) {
        const products = await this.milleniumService.getProductsPaginated(
          batchSize,
          skip,
        );

        if (!products || products.length === 0) {
          hasMore = false;
          break;
        }

        this.logger.log(
          `Processing batch of ${products.length} products (Skip: ${skip})...`,
        );

        const operations = products.map(async (raw) => {
          if (!raw.produto) return; // Ignore if no key

          const externalId = String(raw.produto);

          const productData = {
            externalId: externalId,
            organizationId: defaultOrgId,
            name: raw.descricao1?.trim() || 'Produto Sem Nome',
            price: raw.preco1 ? Number(raw.preco1) : null,
            category:
              raw.departamento !== undefined && raw.departamento !== null
                ? String(raw.departamento)
                : null,
            brand:
              raw.marca !== undefined && raw.marca !== null
                ? String(raw.marca)
                : null,
            status: 'ACTIVE',
            updatedAt: new Date(),
          };

          await this.prisma.product.upsert({
            where: { externalId: externalId },
            update: productData,
            create: {
              ...productData,
              createdAt: new Date(),
            },
          });
        });

        await Promise.all(operations);

        updatedCount += products.length;
        skip += batchSize;

        if (updatedCount >= 1000000) {
          this.logger.warn(
            'Safety limit reached (1,000,000 products). Stopping sync.',
          );
          break;
        }
      }

      this.logger.log(
        `Product Sync Finished. Processed ${updatedCount} products.`,
      );
    } catch (error) {
      this.logger.error(`Product Sync Failed: ${error.message}`, error.stack);
    }
  }
}
