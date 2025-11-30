import { Controller, Post, Body, HttpCode, HttpStatus, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';

@ApiTags('Integração ERP')
@Controller('webhook/erp')
export class SalesController {
  
  constructor(private readonly salesService: SalesService) {}

  @Post('sales')
  @ApiOperation({ summary: 'Recebe venda do Millenium e salva no banco' })
  @ApiResponse({ status: 201, description: 'Venda criada com sucesso.' })
  @HttpCode(HttpStatus.CREATED)
  async receiveSale(@Body() saleData: CreateSaleDto) {
    return this.salesService.processSale(saleData);
  }

  @Get('dashboard-total')
  @ApiOperation({ summary: 'Retorna o total vendido (para o Dashboard)' })
  async getDashboardTotal() {
    return this.salesService.getDailyTotal();
  }

  @Get('dashboard-history')
  @ApiOperation({ summary: 'Retorna histórico de 7 dias (Gráfico)' })
  async getDashboardHistory() {
    return this.salesService.getSalesHistory();
  }

  @Get('stores')
  @ApiOperation({ summary: 'Lista todas as lojas para o filtro do Frontend' })
  async getStores() {
    return this.salesService.getStores();
  }

  @Get('retail-metrics')
  @ApiOperation({ summary: 'Métricas de Varejo filtradas por data e lojas' })
  @ApiQuery({ name: 'start', required: false })
  @ApiQuery({ name: 'end', required: false })
  @ApiQuery({ name: 'stores', required: false, description: 'IDs das lojas separados por vírgula' })
  async getRetailMetrics(
    @Query('start') start?: string,
    @Query('end') end?: string,
    @Query('stores') stores?: string, 
  ) {
    // CORREÇÃO: Passamos 'stores' (string) diretamente, sem converter para array aqui.
    // O Service já tem a lógica de .split(',')
    return this.salesService.getRetailMetrics(start, end, stores);
  }
}