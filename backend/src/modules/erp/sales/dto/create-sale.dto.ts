import {
  IsString,
  IsNumber,
  IsEmail,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSaleDto {
  @ApiProperty({ example: '123' })
  @IsString()
  storeId: string;

  @ApiProperty({ example: 'João Silva' })
  @IsString()
  customerName: string;

  @ApiProperty({ example: 'joao@email.com' })
  @IsEmail()
  customerEmail: string;

  @ApiProperty({ example: '123.456.789-00' })
  @IsString()
  customerCpf: string;

  @ApiProperty({ example: 150.5 })
  @IsNumber()
  totalValue: number;

  @ApiProperty()
  items: any; // Mantendo como any por enquanto, idealmente seria um DTO aninhado

  // --- NOVOS CAMPOS QUE FALTAVAM ---
  @ApiProperty({
    example: 'WhatsApp',
    description: 'Canal de origem da venda',
    required: false,
  })
  @IsString()
  @IsOptional()
  channel?: string;

  @ApiProperty({
    example: true,
    description: 'Se a venda foi influenciada por marketing',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isInfluenced?: boolean;
}
