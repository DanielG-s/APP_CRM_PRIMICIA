import { Controller, Get, Post, Body, Delete, Param } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateEmailSettingsDto } from './dto/update-email-settings.dto';
import { CreateWhatsappInstanceDto } from './dto/create-whatsapp.dto';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // --- Rotas de E-mail ---
  @Get('email')
  getEmail() {
    return this.settingsService.getEmailSettings();
  }

  @Post('email')
  updateEmail(@Body() data: UpdateEmailSettingsDto) {
    return this.settingsService.upsertEmailSettings(data);
  }

  // --- Rotas de WhatsApp ---
  @Get('whatsapp')
  listWhatsapp() {
    return this.settingsService.listWhatsappInstances();
  }

  @Post('whatsapp')
  addWhatsapp(@Body() data: CreateWhatsappInstanceDto) {
    return this.settingsService.addWhatsappInstance(data);
  }

  @Delete('whatsapp/:id')
  deleteWhatsapp(@Param('id') id: string) {
    return this.settingsService.deleteWhatsappInstance(id);
  }
}
