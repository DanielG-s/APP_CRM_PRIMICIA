import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect(); // Conecta quando o app liga
  }

  async onModuleDestroy() {
    await this.$disconnect(); // Desconecta quando o app desliga
  }
}
