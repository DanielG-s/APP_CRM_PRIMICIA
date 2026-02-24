import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Req,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { ClerkAuthGuard } from '../users/clerk-auth.guard';

@UseGuards(ClerkAuthGuard)
@Controller('config/roles')
export class RolesController {
    constructor(private readonly rolesService: RolesService) { }

    @Get()
    findAll(@Req() req: any) {
        const orgId = req.user.organizationId;
        return this.rolesService.findAll(orgId);
    }

    @Get(':id')
    findOne(@Req() req: any, @Param('id') id: string) {
        const orgId = req.user.organizationId;
        return this.rolesService.findOne(orgId, id);
    }

    @Post()
    create(@Req() req: any, @Body() data: any) {
        const orgId = req.user.organizationId;
        const userLevel = req.user.role?.level ?? 999;
        return this.rolesService.create(orgId, userLevel, data);
    }

    @Patch(':id')
    update(@Req() req: any, @Param('id') id: string, @Body() data: any) {
        const orgId = req.user.organizationId;
        const userLevel = req.user.role?.level ?? 999;
        return this.rolesService.update(orgId, id, userLevel, data);
    }

    @Delete(':id')
    remove(@Req() req: any, @Param('id') id: string) {
        const orgId = req.user.organizationId;
        const userLevel = req.user.role?.level ?? 999;
        return this.rolesService.remove(orgId, id, userLevel);
    }
}
