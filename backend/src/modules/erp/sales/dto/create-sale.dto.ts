import { IsString, IsNumber, IsEmail, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class SaleItemDto {
  @ApiProperty({ example: 'Cueca Boxer' })
  @IsString()
  productName: string;

  @ApiProperty({ example: 50.00 })
  @IsNumber()
  price: number;
}

export class CreateSaleDto {
  // --- Dados do Cliente ---
  @ApiProperty({ example: 'João Silva' })
  @IsString()
  customerName: string;

  @ApiProperty({ example: 'joao@email.com' })
  @IsEmail()
  customerEmail: string;

  @ApiProperty({ example: '12345678900' })
  @IsString()
  customerCpf: string;

  // --- Dados da Venda ---
  @ApiProperty({ example: 'LOJA-01' })
  @IsString()
  storeId: string; // O ID da loja no nosso banco

  @ApiProperty({ example: 150.50 })
  @IsNumber()
  totalValue: number;

  @ApiProperty({ type: [SaleItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];
}