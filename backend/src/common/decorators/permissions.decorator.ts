import { SetMetadata as NestSetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...permissions: string[]) => NestSetMetadata(PERMISSIONS_KEY, permissions);
