import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateWhatsappInstanceDto {
  @IsString()
  name: string;

  @IsString()
  number: string;

  @IsString()
  provider: string; // ex: 'evolution', 'waha'

  @IsString()
  instanceName: string;

  @IsString()
  token: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}