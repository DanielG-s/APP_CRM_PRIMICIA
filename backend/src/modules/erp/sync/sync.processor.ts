import { OnWorkerEvent, Processor, WorkerHost, InjectQueue } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job, UnrecoverableError, Queue } from 'bullmq';
import { CustomerSyncService } from './customer-sync.service';
import { ProductSyncService } from './product-sync.service';
import { StoreSyncService } from './store-sync.service';
import { PrismaService } from 'src/prisma/prisma.service';
import * as crypto from 'crypto';

@Processor('erp-sync-queue', {
    concurrency: parseInt(process.env.ERP_SYNC_CONCURRENCY || '1', 10), // Configurable global concurrency
    limiter: {
        max: 10,
        duration: 60000
    }
})
export class SyncProcessor extends WorkerHost {
    private readonly logger = new Logger(SyncProcessor.name);

    constructor(
        private readonly customerSyncService: CustomerSyncService,
        private readonly productSyncService: ProductSyncService,
        private readonly storeSyncService: StoreSyncService,
        private readonly prisma: PrismaService,
        @InjectQueue('erp-sync-queue') private readonly syncQueue: Queue,
    ) {
        super();
    }

    async process(job: Job<any, any, string>): Promise<any> {
        this.logger.log(`Processing job ${job.id} of type ${job.name}`);

        const tenantId = job.data?.tenantId || 'default';
        const lockKey = `lock:erp-sync:${job.name}:${tenantId}`;
        const lockToken = crypto.randomUUID();
        const redisClient = await this.syncQueue.client;

        // B-Audit: Parameterizable TTL and Refresh
        const lockTTL = Number(process.env.ERP_SYNC_LOCK_TTL_SECONDS || 7200);
        const refreshIntervalSeconds = Number(process.env.ERP_SYNC_LOCK_REFRESH_SECONDS || lockTTL / 2);

        // Acquire lock
        const lockAcquired = await redisClient.set(lockKey, lockToken, 'EX', lockTTL, 'NX');

        if (!lockAcquired) {
            this.logger.warn(`Job ${job.name} for tenant ${tenantId} is already running. Lock active. Skipping duplicate.`);
            return { skipped: true, reason: 'lock_active' };
        }

        const startedAt = new Date();

        // Start heartbeat to refresh the lock
        const refreshLuaScript = `
            if redis.call("get", KEYS[1]) == ARGV[1] then
                return redis.call("expire", KEYS[1], ARGV[2])
            else
                return 0
            end
        `;
        const heartbeatTimer = setInterval(async () => {
            try {
                const refreshed = await redisClient.eval(refreshLuaScript, 1, lockKey, lockToken, lockTTL);
                if (refreshed) {
                    this.logger.debug(`Renewed lock for job ${job.name} (Tenant: ${tenantId}) for another ${lockTTL}s`);
                }
            } catch (err) {
                this.logger.error(`Failed to refresh lock for tenant ${tenantId}`, err);
            }
        }, refreshIntervalSeconds * 1000);

        try {
            switch (job.name) {
                case 'sync-customers':
                    // Internal parallelism is handled by batchSize and chunkSize within the service
                    await this.customerSyncService.syncCustomers(true);
                    break;
                case 'sync-products':
                    await this.productSyncService.syncProducts();
                    break;
                case 'sync-stores':
                    await this.storeSyncService.syncStores();
                    break;
                default:
                    this.logger.warn(`Unknown job type: ${job.name}`);
            }
            return { success: true, startedAt: startedAt.toISOString() };
        } catch (error: any) {
            this.logger.error(`Failed to process job ${job.name} (ID: ${job.id}): ${error.message}`);

            const status = error.response?.status;
            if (status >= 400 && status < 500 && status !== 429) {
                throw new UnrecoverableError(`API returned ${status}. Manual fix required. Details: ${error.message}`);
            }

            throw error;
        } finally {
            clearInterval(heartbeatTimer); // Stop heartbeat
            const luaScript = `
                if redis.call("get", KEYS[1]) == ARGV[1] then
                    return redis.call("del", KEYS[1])
                else
                    return 0
                end
            `;
            await redisClient.eval(luaScript, 1, lockKey, lockToken);
            this.logger.log(`Released safe lock for job ${job.name} (Tenant: ${tenantId})`);
        }
    }

    @OnWorkerEvent('completed')
    async onCompleted(job: Job, result: any) {
        const finishedAt = new Date();
        const startedAt = job.processedOn ? new Date(job.processedOn) : new Date(job.timestamp);
        const durationMs = finishedAt.getTime() - startedAt.getTime();

        this.logger.log(`Job ${job.id} completed in ${durationMs}ms`);

        await this.prisma.jobRun.create({
            data: {
                queue: 'erp-sync-queue',
                jobName: job.name,
                jobId: job.id || 'unknown',
                tenantId: job.data?.tenantId,
                status: 'COMPLETED',
                startedAt,
                finishedAt,
                durationMs,
                attemptsMade: job.attemptsMade,
                safePayload: { tenantId: job.data?.tenantId },
            }
        });
    }

    @OnWorkerEvent('failed')
    async onFailed(job: Job, error: Error) {
        this.logger.error(`Job ${job.id} failed with error ${error.message}. Attemps made: ${job.attemptsMade}`);

        if (job.attemptsMade >= (job.opts.attempts || 1)) {
            const finishedAt = new Date();
            const startedAt = job.processedOn ? new Date(job.processedOn) : new Date(job.timestamp);
            const durationMs = finishedAt.getTime() - startedAt.getTime();

            await this.prisma.jobRun.create({
                data: {
                    queue: 'erp-sync-queue',
                    jobName: job.name,
                    jobId: job.id || 'unknown',
                    tenantId: job.data?.tenantId,
                    status: 'FAILED',
                    startedAt,
                    finishedAt,
                    durationMs,
                    attemptsMade: job.attemptsMade,
                    error: error.message,
                    safePayload: { tenantId: job.data?.tenantId },
                }
            });
            this.logger.error(`Job ${job.id} permanently failed and recorded to JobRun table.`);
        }
    }
}
