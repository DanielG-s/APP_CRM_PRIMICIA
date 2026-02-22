import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersSyncService } from './users-sync.service';
import { WebhooksController } from './webhooks.controller';

@Module({
  controllers: [UsersController, WebhooksController],
  providers: [UsersService, UsersSyncService],
  exports: [UsersService, UsersSyncService],
})
export class UsersModule {}
