import { Controller, Get, Post, Body, Patch, Delete, Param, Put } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IntelligenceService } from './intelligence.service';

@ApiTags('Inteligência (RFM)')
@Controller('webhook/crm/intelligence')
export class IntelligenceController {
  constructor(private readonly intelligenceService: IntelligenceService) {}

  @Get('rfm')
  @ApiOperation({ summary: 'Retorna a distribuição da base por RFM' })
  getRFM() {
    return this.intelligenceService.getRfmAnalysis();
  }

  @Get('segmentation-data')
  async getSegmentationData() {
    return this.intelligenceService.getSegmentationData();
  }

  @Get('filters')
  async getFilterOptions() {
    return this.intelligenceService.getFilterOptions();
  }

  @Get('segments')
  async listSegments() {
    return this.intelligenceService.findAllSegments();
  }

  @Get('segments/:id')
  async getSegment(@Param('id') id: string) {
    return this.intelligenceService.getSegmentById(id);
  }

  @Put('segments/:id')
  async updateSegment(@Param('id') id: string, @Body() body: any) {
    // --- ATENÇÃO: MOCK DE USUÁRIO ---
    // Em produção, pegue isso do token de autenticação (ex: user.id)
    // Para testar agora, pegue um ID válido da sua tabela User no banco
    const mockUserId = "ID_DE_UM_USUARIO_EXISTENTE_NO_SEU_BANCO"; 
    
    // Se não tiver nenhum usuário no banco, passe undefined por enquanto:
    // const mockUserId = undefined;

    return this.intelligenceService.updateSegment(id, body, mockUserId);
  }

  @Patch('segments/:id/status')
  async toggleStatus(@Param('id') id: string) {
    return this.intelligenceService.toggleSegmentStatus(id);
  }

  @Delete('segments/:id')
  async deleteSegment(@Param('id') id: string) {
    return this.intelligenceService.deleteSegment(id);
  }

  @Post('segments')
  async createSegment(@Body() body: { name: string; rules: any; isDynamic: boolean }) {
    return this.intelligenceService.createSegment(body);
  }

  @Post('preview')
  async previewSegment(@Body() body: { rules: any[] }) {
    return this.intelligenceService.calculatePreview(body.rules);
  }

}