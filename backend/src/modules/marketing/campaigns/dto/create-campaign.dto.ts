import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsObject,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

class CreateCampaignContentDto {
  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsString()
  @IsOptional()
  mediaUrl?: string;

  // --- NOVO CAMPO ---
  @IsObject()
  @IsOptional()
  designJson?: Record<string, any>; // Permite passar o objeto JSON do editor
}

export class CreateCampaignDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  channel: string;

  @IsString()
  @IsOptional()
  storeId?: string;

  // O erro "Expression Expected" geralmente acontece aqui se tiver uma vírgula extra
  // Exemplo errado: @IsDateString(),
  @IsDateString()
  @IsOptional()
  scheduledAt?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateCampaignContentDto)
  content?: CreateCampaignContentDto;
}
