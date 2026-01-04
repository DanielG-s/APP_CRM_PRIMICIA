import { Controller, Get, Post, Body, Patch, Delete, Param, Put, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IntelligenceService } from './intelligence.service';
import type { Response } from 'express';

@ApiTags('Inteligência (RFM)')
@Controller('webhook/crm/intelligence') // Mantendo sua rota original
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

  // --- MUDANÇA PRINCIPAL AQUI ---
  @Get('segments')
  @ApiOperation({ summary: 'Lista segmentos com dados de tendência e alcance' })
  async listSegments() {
    // Agora chama o método que calcula evolução vs ontem
    return this.intelligenceService.findAllSegmentsWithTrend();
  }

  // --- NOVO ENDPOINT DE TESTE ---
  @Post('segments/snapshot')
  @ApiOperation({ summary: 'Força o snapshot diário manualmente (Para testar histórico agora)' })
  async forceSnapshot() {
    await this.intelligenceService.handleDailySegmentSnapshot();
    return { message: 'Snapshot diário executado com sucesso. Verifique a tabela SegmentHistory.' };
  }

  @Get('segments/:id')
  async getSegment(@Param('id') id: string) {
    return this.intelligenceService.getSegmentById(id);
  }

  @Put('segments/:id')
  async updateSegment(@Param('id') id: string, @Body() body: any) {
    // --- ATENÇÃO: MOCK DE USUÁRIO ---
    // Em produção, pegue isso do req.user.id (via AuthGuard)
    const mockUserId = undefined; 

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

  // --- ROTA DE DOWNLOAD ---
  @Get('segments/:id/export')
  async exportCsv(@Param('id') id: string, @Res() res: Response) {
    const csvContent = await this.intelligenceService.exportSegmentToCsv(id);
    
    // Define o nome do arquivo
    const fileName = `export_segment_${id.substring(0, 8)}.csv`;

    // Headers para forçar download
    res.header('Content-Type', 'text/csv');
    res.attachment(fileName);
    
    // Envia o conteúdo
    return res.send(csvContent);
  }
}