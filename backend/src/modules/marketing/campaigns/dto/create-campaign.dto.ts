import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsObject, IsDateString } from 'class-validator';

export class CreateCampaignDto {
  @ApiProperty({ example: 'Black Friday Email 01' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'email', enum: ['email', 'whatsapp', 'sms'] })
  @IsString()
  @IsNotEmpty()
  channel: string;

  @ApiProperty({ example: 'uuid-da-loja' })
  @IsString()
  @IsNotEmpty()
  storeId: string;

  @ApiProperty({ example: 'uuid-do-segmento-vip', required: false })
  @IsString()
  @IsOptional()
  segmentId?: string;

  @ApiProperty({ example: { subject: "Oferta", sender: "Loja" } })
  @IsObject()
  @IsOptional()
  config?: any;

  @ApiProperty({ example: { body: "Olá cliente...", html: "<div>...</div>" } })
  @IsObject()
  @IsNotEmpty()
  content: any;

  @ApiProperty({ example: '2025-12-31T10:00:00Z', required: false })
  @IsDateString()
  @IsOptional()
  scheduledAt?: string;
}