import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';

@Injectable()
export class CampaignsService {
  constructor(private prisma: PrismaService) {}

  // 1. Simular contagem de audiência (Para a UI mostrar "X pessoas")
  async countAudience(storeId: string, segmentId?: string) {
    // Aqui entraria a lógica real de filtro. 
    // Por enquanto, se for VIP retorna 20%, se for Todos retorna 100%.
    const total = await this.prisma.customer.count({ where: { storeId } });
    
    if (segmentId === 'vip') return Math.floor(total * 0.2);
    if (segmentId === 'inactive') return Math.floor(total * 0.3);
    return total;
  }

  // 2. Criar Campanha Robusta
  async create(data: CreateCampaignDto) {
    // Calcula audiência estimada antes de salvar
    const estimatedReach = await this.countAudience(data.storeId, data.segmentId);
    
    const campaign = await this.prisma.campaign.create({
      data: {
        name: data.name,
        channel: data.channel,
        storeId: data.storeId,
        status: data.scheduledAt ? 'scheduled' : 'draft', // Se tiver data, já agenda
        segmentId: data.segmentId,
        audienceSize: estimatedReach,
        
        // Salva os JSONs de configuração
        config: data.config || {},
        content: data.content || {},
        
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,

        // Cria métrica inicial zerada
        metrics: {
          create: { sentCount: 0, revenueInfluenced: 0 }
        }
      },
    });

    return { message: 'Campanha salva com sucesso!', id: campaign.id };
  }

  // 3. Listar (Mantido com ajuste para ler JSON se precisar)
  async findAll(storeId: string) {
    const campaigns = await this.prisma.campaign.findMany({
      where: { storeId },
      include: { metrics: true },
      orderBy: { createdAt: 'desc' },
    });

    return campaigns.map(c => ({
      id: c.id,
      name: c.name,
      channel: c.channel,
      status: c.status,
      date: c.scheduledAt || c.createdAt,
      sent: c.metrics?.sentCount || 0,
      conversion: c.metrics?.repurchaseRate || 0,
      // Retorna o tamanho do público alvo
      audience: c.audienceSize || 0 
    }));
  }
}