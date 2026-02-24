import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  Patch,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { Throttle, SkipThrottle } from '@nestjs/throttler';

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
      tenantId: user.organizationId,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Lista usuários da loja (Super Admin vê todos)' })
  findAll(@CurrentUser() user: any) {
    return this.usersService.findAll(user);
  }

  @Post('invite')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Roles(Role.SUPER_ADMIN, Role.GERENTE_GERAL)
  @ApiOperation({ summary: 'Convida um novo usuário para a organização' })
  inviteUser(
    @CurrentUser() currentUser: any,
    @Body('email') email: string,
    @Body('name') name: string,
    @Body('role') role: string,
    @Body('organizationId') targetOrganizationId?: string,
  ) {
    return this.usersService.inviteUser(
      currentUser,
      email,
      name,
      role,
      targetOrganizationId,
    );
  }

  @Patch(':id/role')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @Roles(Role.SUPER_ADMIN, Role.GERENTE_GERAL)
  @ApiOperation({ summary: 'Atualiza o perfil de acesso do usuário' })
  updateRole(
    @CurrentUser() currentUser: any,
    @Param('id') targetUserId: string,
    @Body('role') newRole: string,
  ) {
    return this.usersService.updateRole(currentUser, targetUserId, newRole);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.GERENTE_GERAL)
  @ApiOperation({ summary: 'Remove usuário (Local e Clerk)' })
  remove(@CurrentUser() currentUser: any, @Param('id') id: string) {
    return this.usersService.remove(currentUser, id);
  }

  @Post(':id/reset-password')
  @Roles(Role.SUPER_ADMIN, Role.GERENTE_GERAL)
  @ApiOperation({ summary: 'Envia email de redefinição de senha via Clerk' })
  async resetPassword(
    @CurrentUser() currentUser: any,
    @Param('id') targetUserId: string,
  ) {
    return this.usersService.adminResetPassword(currentUser, targetUserId);
  }
}
