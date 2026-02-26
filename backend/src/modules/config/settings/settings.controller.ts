import { Controller, Get, Post, Body, Delete, Param } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateEmailSettingsDto } from './dto/update-email-settings.dto';
import { CreateWhatsappInstanceDto } from './dto/create-whatsapp.dto';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('settings')
@Permissions('app:settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) { }

  // --- Rotas da Loja (Geral) ---
  @Get('store')
  getStore() {
    return this.settingsService.getStore();
  }

  @Post('store')
  updateStore(@Body() data: any) {
    return this.settingsService.updateStore(data);
  }

  // --- Rotas de E-mail ---
  @Get('email')
  @Permissions('app:integrations')
  getEmail() {
    return this.settingsService.getEmailSettings();
  }

  @Post('email')
  @Permissions('app:integrations')
  updateEmail(@Body() data: UpdateEmailSettingsDto) {
    return this.settingsService.upsertEmailSettings(data);
  }

  // --- Rotas de WhatsApp ---
  @Get('whatsapp')
  @Permissions('app:integrations')
  listWhatsapp() {
    return this.settingsService.listWhatsappInstances();
  }

  @Post('whatsapp')
  @Permissions('app:integrations')
  addWhatsapp(@Body() data: CreateWhatsappInstanceDto) {
    return this.settingsService.addWhatsappInstance(data);
  }

  @Delete('whatsapp/:id')
  @Permissions('app:integrations')
  deleteWhatsapp(@Param('id') id: string) {
    return this.settingsService.deleteWhatsappInstance(id);
  }
}
