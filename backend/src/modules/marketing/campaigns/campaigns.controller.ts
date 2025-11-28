import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
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
}