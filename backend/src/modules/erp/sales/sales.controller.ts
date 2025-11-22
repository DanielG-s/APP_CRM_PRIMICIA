import { Controller, Post, Body, HttpCode, HttpStatus, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';

@ApiTags('Integração ERP')
@Controller('webhook/erp')
export class SalesController {
  
  constructor(private readonly salesService: SalesService) {}

  @Post('sales')
  @ApiOperation({ summary: 'Recebe venda do Millenium e salva no banco' })
  @ApiResponse({ status: 201, description: 'Venda criada com sucesso.' })
  @HttpCode(HttpStatus.CREATED) // Garante o 201
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
}
