import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule'; 
import { IntelligenceController } from './intelligence.controller';
import { IntelligenceService } from './intelligence.service';

import { PrismaService } from '../../../prisma/prisma.service'; 

// Se der erro de novo, tente: import { PrismaService } from '../../../database/prisma.service';
// Ou se estiver na raiz do src: import { PrismaService } from '../../../prisma.service';

@Module({
  imports: [
    ScheduleModule.forRoot() // Ativa o Cron Job
  ],
  controllers: [IntelligenceController],
  providers: [IntelligenceService, PrismaService],
})
export class IntelligenceModule {}