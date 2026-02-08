import { Module } from '@nestjs/common';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [SalesController],
  providers: [SalesService],
  // Não precisamos exportar o service a menos que outro módulo vá usar
})
export class SalesModule {}
