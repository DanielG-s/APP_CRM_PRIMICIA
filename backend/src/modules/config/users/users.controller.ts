
import { Controller, Get, Post, Body, Delete, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@ApiTags('Configuração: Usuários')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('me')
    @ApiOperation({ summary: 'Retorna o perfil do usuário logado' })
    getProfile(@CurrentUser() user: any) {
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            tenantId: user.storeId,
        };
    }

    @Get()
    @ApiOperation({ summary: 'Lista usuários da loja' })
    findAll() {
        return this.usersService.findAll();
    }

    @Post()
    @ApiOperation({ summary: 'Cria novo usuário' })
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Remove usuário' })
    remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }
}
