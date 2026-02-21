import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class QueueCleanupService {
    private readonly logger = new Logger(QueueCleanupService.name);

    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
    ) { }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleCleanup() {
        const retentionDays = Number(this.configService.get('RETENTION_DAYS_JOBRUN', 90));
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

        this.logger.log(`Starting JobRun cleanup. pruning records older than ${retentionDays} days (Before ${cutoffDate.toISOString()})`);

        try {
            const result = await this.prisma.jobRun.deleteMany({
                where: {
                    startedAt: {
                        lt: cutoffDate,
                    },
                },
            });

            this.logger.log(`Cleanup finished. Removed ${result.count} stale JobRun records.`);
        } catch (error) {
            this.logger.error(`Failed to cleanup JobRun table: ${error.message}`);
        }
    }
}
