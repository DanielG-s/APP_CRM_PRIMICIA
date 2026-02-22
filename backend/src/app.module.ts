import { Module, Global, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import basicAuth from 'express-basic-auth';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { APP_GUARD } from '@nestjs/core';
import { ClerkAuthGuard } from './modules/config/users/clerk-auth.guard';

import { SalesModule } from 'src/modules/erp/sales/sales.module';
import { CustomersModule } from './modules/erp/customers/customers.module';
import { IntelligenceModule } from './modules/crm/intelligence/intelligence.module';
import { CampaignsModule } from './modules/marketing/campaigns/campaigns.module';
import { SettingsModule } from './modules/config/settings/settings.module';
import { UsersModule } from './modules/config/users/users.module';
import { ErpModule } from './modules/erp/erp.module';
import { HealthController } from './health.controller';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const nodeEnv = configService.get('NODE_ENV', 'development');
        // Docker environments use 'redis'. Local dev uses 'localhost'.
        const defaultHost = (nodeEnv === 'production' || nodeEnv === 'qa') ? 'redis' : 'localhost';

        return {
          connection: {
            host: configService.get('REDIS_HOST', defaultHost),
            port: configService.get('REDIS_PORT', 6379),
            password: configService.get('REDIS_PASSWORD'),
          },
        };
      },
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'erp-sync-queue',
    }),
    // Only import BullBoardModule if it is enabled. This prevents the route from even existing.
    ...(process.env.ENABLE_BULLBOARD === 'true'
      ? [
        BullBoardModule.forRoot({
          route: '/admin/queues',
          adapter: ExpressAdapter,
        }),
      ]
      : []),
    SalesModule,
    CustomersModule,
    IntelligenceModule,
    CampaignsModule,
    SettingsModule,
    UsersModule,
    ErpModule,
  ],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: ClerkAuthGuard,
    },
  ],
  exports: [PrismaService],
})
export class AppModule implements NestModule {
  constructor(private configService: ConfigService) { }

  configure(consumer: MiddlewareConsumer) {
    const isBullBoardEnabled = this.configService.get('ENABLE_BULLBOARD', 'false') === 'true';

    if (isBullBoardEnabled) {
      const user = this.configService.get('BULLBOARD_USER');
      const pass = this.configService.get('BULLBOARD_PASS');

      if (!user || !pass) {
        throw new Error(
          'Bull Board is enabled but BULLBOARD_USER or BULLBOARD_PASS is missing. Refusing to start insecurely.',
        );
      }

      consumer
        .apply(basicAuth({ users: { [user]: pass }, challenge: true }))
        .forRoutes('/admin/queues');
    }
    // If disabled, the BullBoardModule is not imported, so /admin/queues will 404 naturally.
  }
}
