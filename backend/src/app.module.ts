import { Module, Global } from '@nestjs/common';
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