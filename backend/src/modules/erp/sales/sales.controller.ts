import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';

@ApiTags('Integração ERP')
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) { }

  // --- WEBHOOKS & INGESTÃO ---
  /**
   * Webhook to receive a single sale from Millenium ERP.
   * Creates or updates the customer and logs the transaction.
   */
  @Post('sales')
  @ApiOperation({ summary: 'Recebe venda do Millenium e salva no banco' })
  @ApiResponse({ status: 201, description: 'Venda criada com sucesso.' })
  @HttpCode(HttpStatus.CREATED)
  async receiveSale(@Body() saleData: CreateSaleDto) {
    return this.salesService.processSale(saleData);
  }

  @Post('webhook')
  create(@Body() createSaleDto: CreateSaleDto) {
    return this.salesService.processSale(createSaleDto);
  }

  // --- ENDPOINTS AUXILIARES ---
  /**
   * Returns total sales and transaction count for the current day.
   */
  @Get('dashboard-total')
  @ApiOperation({ summary: 'Retorna o total vendido HOJE' })
  async getDashboardTotal() {
    return this.salesService.getDailyTotal();
  }

  @Get('dashboard-history')
  @ApiOperation({ summary: 'Retorna histórico de 7 dias' })
  async getSalesHistory() {
    return this.salesService.getSalesHistory();
  }

  @Get('recent-sales')
  @ApiOperation({ summary: 'Retorna as 5 últimas vendas' })
  async getRecentSales() {
    return this.salesService.getRecentSales();
  }

  /**
   * Lists all active stores.
   */
  @Get('stores')
  @ApiOperation({ summary: 'Lista todas as lojas' })
  async getStores() {
    return this.salesService.getStores();
  }

  // --- 1. FILTROS (CANAIS) ---
  @Get('filter-options')
  async getFilterOptions() {
    return this.salesService.getFilterOptions();
  }

  // --- 2. DASHBOARD DE CANAIS (CAMPAIGNS) ---
  /**
   * Channel Performance Dashboard.
   * Analyzes sales by acquisition channel (WhatsApp, Email, etc.)
   */
  @Get('channel-results')
  async getChannelResults(
    @Query('start') start: string,
    @Query('end') end: string,
    @Query('channel') channel?: string,
    @Query('campaigns') campaigns?: string | string[],
    @Query('tags') tags?: string | string[],
    @Query('campaignType') campaignType?: string | string[],
    @Query('conversionEvent') conversionEvent?: string,
    @Query('conversionWindow') conversionWindow?: string,
  ) {
    const startDate =
      start ||
      new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1,
      ).toISOString();
    const endDate = end || new Date().toISOString();

    const campaignIds = campaigns
      ? Array.isArray(campaigns)
        ? campaigns
        : [campaigns]
      : undefined;
    const tagsList = tags ? (Array.isArray(tags) ? tags : [tags]) : undefined;
    const typesList = campaignType
      ? Array.isArray(campaignType)
        ? campaignType
        : [campaignType]
      : undefined;

    return this.salesService.getChannelDashboard(startDate, endDate, {
      channel,
      campaignIds,
      tags: tagsList,
      campaignType: typesList,
      conversionEvent,
      conversionWindow,
    });
  }

  // --- 3. DASHBOARD DE VAREJO (RETAIL) ---
  // AQUI FOI FEITA A CORREÇÃO PRINCIPAL
  /**
   * Retail Metrics Dashboard.
   * Provides high-level KPIs (Revenue, Ticket, etc.) filtered by date and store.
   */
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
    // 1. Definição de Datas Segura
    // Se não vier data, pega os últimos 30 dias
    const endDate = end ? new Date(end) : new Date();
    const startDate = start
      ? new Date(start)
      : new Date(new Date().setDate(endDate.getDate() - 30));

    // 2. Ajuste Fino do Horário (00:00 -> 23:59)
    // Isso garante que pegamos as vendas do último dia inteiro
    const endFinal = new Date(endDate);
    endFinal.setHours(23, 59, 59, 999);

    // 3. Tratamento de Lojas (String -> Array)
    const storeIds = stores ? stores.split(',') : undefined;

    // Passamos Objetos Date reais para o Service agora
    return this.salesService.getRetailMetrics(startDate, endFinal, storeIds);
  }

  // --- 4. DASHBOARD DE AGENDA ---
  @Get('schedule-metrics')
  @ApiOperation({ summary: 'Métricas da página de Agenda' })
  async getScheduleMetrics(
    @Query('start') start: string,
    @Query('end') end: string,
    @Query('channel') channel?: string,
    @Query('campaigns') campaigns?: string | string[],
    @Query('tags') tags?: string | string[],
    @Query('campaignType') campaignType?: string | string[],
    @Query('stores') stores?: string | string[],
    @Query('vendedores') vendedores?: string | string[],
    @Query('conversionWindow') conversionWindow?: string,
  ) {
    const startDate =
      start ||
      new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1,
      ).toISOString();
    const endDate = end || new Date().toISOString();

    const campaignIds = campaigns
      ? Array.isArray(campaigns)
        ? campaigns
        : [campaigns]
      : undefined;
    const tagsList = tags ? (Array.isArray(tags) ? tags : [tags]) : undefined;
    const typesList = campaignType
      ? Array.isArray(campaignType)
        ? campaignType
        : [campaignType]
      : undefined;
    const storeIds = stores
      ? Array.isArray(stores)
        ? stores
        : [stores]
      : undefined;
    const salespersonIds = vendedores
      ? Array.isArray(vendedores)
        ? vendedores
        : [vendedores]
      : undefined;

    return this.salesService.getScheduleMetrics(startDate, endDate, {
      channel,
      campaignIds,
      tags: tagsList,
      campaignType: typesList,
      storeIds,
      salespersonIds,
      conversionWindow,
    });
  }
}
