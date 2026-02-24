import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';

// Se você já tem o AuthGuard configurado (JWT), importe ele aqui:
// import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('campaigns')
// @UseGuards(JwtAuthGuard) // <--- Descomente isso para proteger as rotas
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) { }

  /**
   * Creates a new marketing campaign.
   * Automatically assigns the store ID based on the logged-in user.
   */
  @Post()
  async create(@Body() createCampaignDto: CreateCampaignDto, @Req() req: any) {
    // 1. Tenta pegar o organizationId do usuário logado (Token JWT)
    const userOrgId = req.user?.organizationId;
    const userStoreId = req.user?.storeId;

    // 2. Se o usuário estiver logado, forçamos o orgId dele no DTO por segurança
    if (userOrgId) {
      createCampaignDto.organizationId = userOrgId;
    }
    if (userStoreId) {
      createCampaignDto.storeId = userStoreId;
    }

    // 3. Validação extra caso o orgId não venha nem do Token nem do Corpo
    if (!createCampaignDto.organizationId) {
      throw new BadRequestException(
        'Organization ID não encontrado. Faça login ou envie o organizationId.',
      );
    }

    return this.campaignsService.create(createCampaignDto);
  }

  /**
   * Lists all campaigns for the logged-in user's store.
   */
  @Get()
  async findAll(@Req() req: any) {
    const orgId = req.user?.organizationId;

    if (!orgId) {
      // Retorna array vazio ou erro se não souber qual org buscar
      throw new BadRequestException(
        'Organization ID necessário para buscar campanhas.',
      );
    }

    return this.campaignsService.findAll(orgId);
  }
}
