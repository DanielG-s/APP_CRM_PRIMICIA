import { Controller, Post, Body } from '@nestjs/common';
import { SyncService } from './sync.service';

@Controller('erp/sync')
export class SyncController {
    constructor(private readonly syncService: SyncService) { }

    @Post('sales')
    async syncSales(@Body() body: any) {
        return this.syncService.syncSales(body);
    }
}
