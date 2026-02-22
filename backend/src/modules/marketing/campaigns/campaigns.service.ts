import { Injectable, BadRequestException } from '@nestjs/common'; // Adicione BadRequestException
import { PrismaService } from '../../../prisma/prisma.service'; // Ajuste o caminho conforme seu projeto
import { CreateCampaignDto } from './dto/create-campaign.dto';

@Injectable()
export class CampaignsService {
  constructor(private readonly prisma: PrismaService) { }

  // --- CORREÇÃO DO ERRO 1: Adicionar o método findAll ---
  /**
   * Retrieves all campaigns for a specific store.
   * Includes related content and metrics.
   * @param storeId The ID of the store to filter by.
   */
  async findAll(organizationId: string) {
    return this.prisma.campaign.findMany({
      where: { organizationId },
      include: { contents: true, metrics: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Creates a new campaign with associated content.
   * Validates store ID and maps DTO fields to Prisma schema.
   */
  async create(data: CreateCampaignDto) {
    // --- CORREÇÃO DO ERRO 5: Garantir que organizationId existe ---
    if (!data.organizationId) {
      throw new BadRequestException(
        'Organization ID é obrigatório para criar uma campanha.',
      );
    }

    // --- CORREÇÃO DOS ERROS 2, 3 e 4: Mapear os campos corretos do DTO ---
    // O DTO usa 'body' em vez de 'html' e 'designJson' em vez de 'json'
    const bodyContent = data.content?.body || '';
    const designData = data.content?.designJson || null;
    const subject = data.content?.subject || null; // O subject está dentro de content

    return this.prisma.campaign.create({
      data: {
        name: data.name,
        channel: data.channel,
        organizationId: data.organizationId,
        storeId: data.storeId,
        status: 'draft', // Valor padrão
        conversionTrigger: 'manual', // Valor padrão ou vindo do DTO se existir

        // Criação do relacionamento com CampaignContent
        contents: {
          create: {
            subject: subject,
            body: bodyContent,
            designJson: designData ?? undefined, // Prisma prefere undefined a null para campos opcionais Json
          },
        },
      },
      include: {
        contents: true,
      },
    });
  }
}
