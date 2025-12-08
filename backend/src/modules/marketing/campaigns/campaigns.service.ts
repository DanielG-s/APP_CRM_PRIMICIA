// src/modules/marketing/campaigns/campaigns.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; // Ajuste o caminho se necessário
import { CreateCampaignDto } from './dto/create-campaign.dto'; // Ajuste se necessário

@Injectable()
export class CampaignsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    // AQUI ESTAVA O ERRO: Precisamos passar o 'date' agora que ele é obrigatório no Schema
    // Lógica: Se tiver agendamento, usa a data agendada. Se não, usa a data de agora.
    const campaignDate = data.scheduledAt ? new Date(data.scheduledAt) : new Date();

    return this.prisma.campaign.create({
      data: {
        name: data.name,
        channel: data.channel,
        storeId: data.storeId, // Assumindo que você recebe o ID da loja
        status: data.status || 'draft',
        segmentId: data.segmentId,
        audienceSize: data.audienceSize || 0,
        config: data.config || {},
        content: data.content || {},
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        
        // --- CAMPO NOVO OBRIGATÓRIO ---
        date: campaignDate, 
        // ------------------------------

        // Inicializa métricas zeradas
        metrics: {
          create: {
            sentCount: 0,
            revenueInfluenced: 0,
            repurchaseRate: 0
          }
        },
        
        // Inicializa contadores zerados no próprio model (Opcional, pois já tem default(0) no schema, mas garante)
        sent: 0,
        delivered: 0,
        opens: 0,
        clicks: 0,
        softBounces: 0,
        hardBounces: 0,
        spamReports: 0,
        unsubscribes: 0
      },
    });
  }

  async findAll(storeId?: string) {
    const where = storeId ? { storeId } : {};

    return this.prisma.campaign.findMany({
      where, // Aplica o filtro de loja se o ID for passado
      orderBy: { createdAt: 'desc' },
      include: { metrics: true }
    });
  }

  async findOne(id: string) {
    return this.prisma.campaign.findUnique({
      where: { id },
      include: { metrics: true }
    });
  }
}