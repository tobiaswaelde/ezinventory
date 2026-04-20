import { Module } from '@nestjs/common';

import { AuthModule } from '~/modules/auth/auth.module.js';
import { ItemsController } from '~/modules/items/items.controller.js';
import { ItemsService } from '~/modules/items/items.service.js';

@Module({
  imports: [AuthModule],
  controllers: [ItemsController],
  providers: [ItemsService]
})
export class ItemsModule {}
