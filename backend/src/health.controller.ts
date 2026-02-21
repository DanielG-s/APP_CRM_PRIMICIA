import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Controller('health')
export class HealthController {
    constructor(
        private prisma: PrismaService,
        @InjectQueue('erp-sync-queue') private syncQueue: Queue,
    ) { }

    @Get()
    async getHealth() {
        return { status: 'OK', timestamp: new Date() };
    }

    @Get('ready')
    async getReadiness() {
        const checks: any = { database: 'DOWN', redis: 'DOWN' };

        try {
            await this.prisma.$queryRaw`SELECT 1`;
            checks.database = 'UP';
        } catch (e) { }

        try {
            const client = await this.syncQueue.client;
            await client.ping();
            checks.redis = 'UP';
        } catch (e) { }

        const isReady = Object.values(checks).every((v) => v === 'UP');
        const responseData = { status: isReady ? 'READY' : 'NOT_READY', checks };

        if (!isReady) {
            throw new HttpException(responseData, HttpStatus.SERVICE_UNAVAILABLE);
        }

        return responseData;
    }
}
