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
  @ApiOperation({ summary: 'Retorna o total vendido HOJE (para o Dashboard)' })
  async getDashboardTotal() {
    return this.salesService.getDailyTotal();
  }

  @Get('dashboard-history')
  @ApiOperation({ summary: 'Retorna histórico de 7 dias (Gráfico)' })
  async getDashboardHistory() {
    return this.salesService.getSalesHistory();
  }

  @Get('recent-sales')
  @ApiOperation({ summary: 'Retorna as 5 últimas vendas realizadas' })
  async getRecentSales() {
    return this.salesService.getRecentSales();
  }

  @Get('stores')
  @ApiOperation({ summary: 'Lista todas as lojas' })
  async getStores() {
    return this.salesService.getStores();
  }

  @Get('retail-metrics')
  @ApiOperation({ summary: 'Métricas de Varejo filtradas' })
  @ApiQuery({ name: 'start', required: false })
  @ApiQuery({ name: 'end', required: false })
  @ApiQuery({ name: 'stores', required: false })
  async getRetailMetrics(
    @Query('start') start?: string,
    @Query('end') end?: string,
    @Query('stores') stores?: string, 
  ) {
    return this.salesService.getRetailMetrics(start, end, stores);
  }
}