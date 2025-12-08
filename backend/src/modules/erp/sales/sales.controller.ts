import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post('webhook')
  create(@Body() createSaleDto: CreateSaleDto) {
    return this.salesService.processSale(createSaleDto);
  }

  @Get('channel-results')
  async getChannelResults(
    @Query('start') start: string,
    @Query('end') end: string,
    @Query('channel') channel?: string,
    @Query('campaignId') campaignId?: string,
  ) {
    const startDate = start || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const endDate = end || new Date().toISOString();

    return this.salesService.getChannelDashboard(startDate, endDate, {
        channel,
        campaignId
    });
  }
}