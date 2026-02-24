import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStoreDto {
  @ApiProperty({ description: 'Nome da Loja', example: 'Minha Loja' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'CNPJ',
    required: false,
    example: '00.000.000/0001-00',
  })
  @IsString()
  @IsOptional()
  cnpj?: string;

  @ApiProperty({ description: 'Cidade Normalizada', required: false })
  @IsString()
  @IsOptional()
  cityNormalized?: string;
}
