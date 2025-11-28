import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';

@Injectable()
export class CampaignsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateCampaignDto) {
    // Salva a campanha no banco
    const campaign = await this.prisma.campaign.create({
      data: {
        name: data.name,
        channel: data.channel,
        storeId: data.storeId,
        status: 'scheduled', // Começa como "Agendada"
        conversionTrigger: 'click', // Padrão
        contents: {
            create: {
                body: data.message
            }
        }
      },
    });

    return { message: 'Campanha agendada com sucesso!', id: campaign.id };
  }
}