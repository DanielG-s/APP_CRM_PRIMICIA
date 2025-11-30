import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';

@ApiTags('Marketing (Campanhas)')
@Controller('webhook/marketing/campaigns')
export class CampaignsController {
  constructor(private readonly service: CampaignsService) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma nova campanha de disparo' })
  create(@Body() data: CreateCampaignDto) {
    return this.service.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'Lista histórico de campanhas da loja' })
  @ApiQuery({ name: 'storeId', required: true, example: 'uuid-da-loja' })
  findAll(@Query('storeId') storeId: string) {
    // Se não vier storeId, retornamos array vazio ou erro (aqui optei por array vazio para segurança)
    if (!storeId) return [];
    return this.service.findAll(storeId);
  }
}