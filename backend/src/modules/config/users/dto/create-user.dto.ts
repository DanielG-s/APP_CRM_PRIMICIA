
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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

    @ApiProperty({ example: 'admin', description: 'Role do usuário' })
    @IsString()
    @IsNotEmpty()
    role: string;
}
