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
  constructor(private readonly campaignsService: CampaignsService) {}

  /**
   * Creates a new marketing campaign.
   * Automatically assigns the store ID based on the logged-in user.
   */
  @Post()
  async create(@Body() createCampaignDto: CreateCampaignDto, @Req() req: any) {
    // 1. Tenta pegar o storeId do usuário logado (Token JWT)
    const userStoreId = req.user?.storeId;

    // 2. Se o usuário estiver logado, forçamos o storeId dele no DTO por segurança
    if (userStoreId) {
      createCampaignDto.storeId = userStoreId;
    }

    // 3. Validação extra caso o storeId não venha nem do Token nem do Corpo
    if (!createCampaignDto.storeId) {
      // Se você estiver testando sem login, lembre-se de enviar "storeId" no JSON
      throw new BadRequestException(
        'Store ID não encontrado. Faça login ou envie o storeId.',
      );
    }

    return this.campaignsService.create(createCampaignDto);
  }

  /**
   * Lists all campaigns for the logged-in user's store.
   */
  @Get()
  async findAll(@Req() req: any) {
    // Pega o ID da loja do usuário logado
    const storeId = req.user?.storeId;

    // Se estiver testando sem login, você pode pegar de uma query param temporariamente:
    // const storeId = req.query.storeId;

    if (!storeId) {
      // Retorna array vazio ou erro se não souber qual loja buscar
      throw new BadRequestException(
        'Store ID necessário para buscar campanhas.',
      );
    }

    return this.campaignsService.findAll(storeId);
  }
}
