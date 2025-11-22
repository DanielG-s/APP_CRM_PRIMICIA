import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CustomersService } from './customers.service';

@ApiTags('Clientes (CRM)')
@Controller('webhook/erp/customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @ApiOperation({ summary: 'Lista todos os clientes com LTV calculado' })
  async getAllCustomers() {
    return this.customersService.findAll();
  }
}