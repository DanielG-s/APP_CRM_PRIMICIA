import { Controller, Post, Body } from '@nestjs/common';
import { SyncService } from './sync.service';

@Controller('erp/sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) { }

  @Post('sales')
  async syncSales(@Body() body: { start?: string; end?: string }) {
    const start = body.start ? new Date(body.start) : new Date(new Date().setDate(new Date().getDate() - 1));
    const end = body.end ? new Date(body.end) : new Date();

    // Ensure start is beginning of day if defaulted
    if (!body.start) start.setHours(0, 0, 0, 0);
    // Ensure end is end of day if defaulted (or matches start day)
    if (!body.end) end.setHours(23, 59, 59, 999);

    return this.syncService.syncSales(start, end);
  }
}
