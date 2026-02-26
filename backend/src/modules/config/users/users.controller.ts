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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ClerkAuthGuard } from './clerk-auth.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { Throttle, SkipThrottle } from '@nestjs/throttler';

@ApiTags('Configuração: Usuários')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get('me')
  @ApiOperation({ summary: 'Retorna o perfil do usuário logado' })
  async getProfile(@CurrentUser() user: any) {
    const org = user.organizationId
      ? await this.usersService.getOrganizationName(user.organizationId)
      : null;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.organizationId,
      organizationName: org?.name || 'Sem organização',
    };
  }

  @Get()
  @Permissions('app:team')
  @ApiOperation({ summary: 'Lista usuários da loja (Super Admin vê todos)' })
  findAll(@CurrentUser() user: any) {
    return this.usersService.findAll(user);
  }

  @Post('invite')
  @Permissions('app:team')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Convida um novo usuário para a organização' })
  inviteUser(
    @CurrentUser() currentUser: any,
    @Body('email') email: string,
    @Body('name') name: string,
    @Body('roleId') roleId: string,
    @Body('storeIds') storeIds?: string[],
    @Body('organizationId') targetOrganizationId?: string,
  ) {
    return this.usersService.inviteUser(
      currentUser,
      email,
      name,
      roleId,
      storeIds,
      targetOrganizationId,
    );
  }

  @Patch(':id/role')
  @Permissions('app:team')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiOperation({ summary: 'Altera o cargo do usuário' })
  updateRole(
    @CurrentUser() currentUser: any,
    @Param('id') targetUserId: string,
    @Body('roleId') newRoleId: string,
    @Body('storeIds') storeIds?: string[],
  ) {
    return this.usersService.updateRole(currentUser, targetUserId, newRoleId, storeIds);
  }

  @Delete(':id')
  @Permissions('app:team')
  @ApiOperation({ summary: 'Deleta o usuário especificado' })
  remove(@CurrentUser() currentUser: any, @Param('id') id: string) {
    return this.usersService.remove(currentUser, id);
  }

  @Post(':id/reset-password')
  @Permissions('app:team')
  @ApiOperation({ summary: 'Envia email de redefinição de senha via Clerk' })
  async resetPassword(
    @CurrentUser() currentUser: any,
    @Param('id') targetUserId: string,
  ) {
    return this.usersService.adminResetPassword(currentUser, targetUserId);
  }
}
