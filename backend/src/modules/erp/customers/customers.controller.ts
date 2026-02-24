import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CustomersService } from './customers.service';

@ApiTags('Clientes (CRM)')
@Controller('webhook/erp/customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) { }

  @Get()
  @ApiOperation({
    summary: 'Lista carteira de clientes com Status, LTV e Recência calculados',
  })
  async getAllCustomers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortDir') sortDir?: string,
    @Query('segments') segments?: string,
  ) {
    return this.customersService.findAll({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      search: search || '',
      sortBy: sortBy || 'createdAt',
      sortDir: sortDir || 'desc',
      segments: segments ? segments.split(',') : [],
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes de um cliente específico' })
  async getCustomerById(@Param('id') id: string) {
    return this.customersService.findById(id);
  }
}
