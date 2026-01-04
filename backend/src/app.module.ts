import { Module, Global } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule'; // <--- IMPORTADO
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

import { SalesModule } from 'src/modules/erp/sales/sales.module'; 
import { CustomersModule } from './modules/erp/customers/customers.module';
import { IntelligenceModule } from './modules/crm/intelligence/intelligence.module';
import { CampaignsModule } from './modules/marketing/campaigns/campaigns.module';

@Global()
@Module({
  imports: [
    ScheduleModule.forRoot(), // <--- HABILITA O AGENDADOR DE TAREFAS
    SalesModule, 
    CustomersModule,
    IntelligenceModule,
    CampaignsModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
  exports: [PrismaService],
})
export class AppModule {}