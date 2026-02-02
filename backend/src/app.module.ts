import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule'; // <--- IMPORTADO
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

import { SalesModule } from 'src/modules/erp/sales/sales.module';
import { CustomersModule } from './modules/erp/customers/customers.module';
import { IntelligenceModule } from './modules/crm/intelligence/intelligence.module';
import { CampaignsModule } from './modules/marketing/campaigns/campaigns.module';
import { SettingsModule } from './modules/config/settings/settings.module';
import { ErpModule } from './modules/erp/erp.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // <--- CARREGA .ENV
    ScheduleModule.forRoot(), // <--- HABILITA O AGENDADOR DE TAREFAS
    SalesModule,
    CustomersModule,
    IntelligenceModule,
    CampaignsModule,
    SettingsModule,
    ErpModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
  exports: [PrismaService],
})
export class AppModule { }