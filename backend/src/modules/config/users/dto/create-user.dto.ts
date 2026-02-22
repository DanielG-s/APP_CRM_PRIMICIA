import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ example: 'João Silva' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'joao@loja.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '123456', description: 'Senha inicial' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'VENDEDOR',
    enum: Role,
    description: 'Role do usuário',
  })
  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;
}
