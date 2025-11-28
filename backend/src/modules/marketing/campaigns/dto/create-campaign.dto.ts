import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCampaignDto {
  @ApiProperty({ example: 'Promoção de Inverno' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'whatsapp' })
  @IsString()
  channel: string;

  @ApiProperty({ example: 'vip' })
  @IsString()
  segment: string;

  @ApiProperty({ example: 'Olá, confira nossas ofertas!' })
  @IsString()
  message: string;

  @ApiProperty({ example: 'uuid-da-loja' })
  @IsString()
  storeId: string;
}