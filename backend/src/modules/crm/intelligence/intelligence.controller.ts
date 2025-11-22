import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IntelligenceService } from './intelligence.service';

@ApiTags('Inteligência (RFM)')
@Controller('webhook/crm/intelligence')
export class IntelligenceController {
  constructor(private readonly service: IntelligenceService) {}

  @Get('rfm')
  @ApiOperation({ summary: 'Retorna a distribuição da base por RFM' })
  getRFM() {
    return this.service.getRfmAnalysis();
  }
}