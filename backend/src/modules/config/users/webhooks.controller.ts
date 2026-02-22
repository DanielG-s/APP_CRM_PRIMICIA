import { Controller, Post, Headers, Body, BadRequestException } from '@nestjs/common';
import { Webhook } from 'svix';
import { ConfigService } from '@nestjs/config';
import { UsersSyncService } from './users-sync.service';
import { Public } from '../../../common/decorators/public.decorator';

@Controller('webhooks/clerk')
export class WebhooksController {
    constructor(
        private configService: ConfigService,
        private syncService: UsersSyncService
    ) { }

    @Public()
    @Post()
    async handleWebhook(
        @Headers('svix-id') id: string,
        @Headers('svix-timestamp') timestamp: string,
        @Headers('svix-signature') signature: string,
        @Body() payload: any
    ) {
        const secret = this.configService.get('CLERK_WEBHOOK_SECRET');
        if (!secret) throw new BadRequestException('Webhook secret not configured');

        const wh = new Webhook(secret);
        let evt: any;

        try {
            evt = wh.verify(JSON.stringify(payload), {
                'svix-id': id,
                'svix-timestamp': timestamp,
                'svix-signature': signature,
            });
        } catch (err) {
            throw new BadRequestException('Invalid signature');
        }

        const { type, data } = evt;

        if (type === 'user.created' || type === 'user.updated') {
            const { id: clerkId, email_addresses, first_name, last_name, public_metadata } = data;
            const email = email_addresses[0].email_address;
            const name = `${first_name} ${last_name}`.trim();
            const storeId = public_metadata?.storeId;
            await this.syncService.syncUser(clerkId, email, name, storeId);
        }

        if (type === 'user.deleted') {
            await this.syncService.removeUser(data.id);
        }

        return { success: true };
    }
}
