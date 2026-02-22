import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import * as express from 'express';
import { PrismaService } from './prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

import { Public } from './common/decorators/public.decorator';

@Public()
@Controller('health')
export class HealthController {
    constructor(
        private readonly prisma: PrismaService,
        @InjectQueue('erp-sync-queue') private readonly syncQueue: Queue,
    ) { }

    @Get()
    async health(@Res() res: express.Response) {
        return res.status(HttpStatus.OK).json({ status: 'ok', timestamp: new Date() });
    }

    @Get('ready')
    async ready(@Res() res: express.Response) {
        const checks: any = {
            prisma: 'down',
            redis: 'down',
        };

        try {
            await this.prisma.$queryRaw`SELECT 1`;
            checks.prisma = 'up';
        } catch (e) {
            checks.prisma = 'error';
        }

        try {
            const client = await this.syncQueue.client;
            await client.ping();
            checks.redis = 'up';
        } catch (e) {
            checks.redis = 'error';
        }

        const isReady = checks.prisma === 'up' && checks.redis === 'up';

        return res.status(isReady ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE).json({
            status: isReady ? 'ready' : 'not_ready',
            checks,
        });
    }
}
