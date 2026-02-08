import {
  IsString,
  IsInt,
  IsBoolean,
  IsEmail,
  IsOptional,
} from 'class-validator';

export class UpdateEmailSettingsDto {
  @IsString()
  senderName: string;

  @IsEmail()
  senderEmail: string;

  @IsOptional()
  @IsString() // Alterado para string pois pode vir vazio
  replyTo?: string;

  @IsString()
  host: string;

  @IsInt()
  port: number;

  @IsString()
  user: string;

  @IsString()
  pass: string;

  @IsBoolean()
  secure: boolean;
}
