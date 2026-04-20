import { Module } from '@nestjs/common';

import { ItemsController } from '~/modules/items/items.controller.js';
import { ItemsService } from '~/modules/items/items.service.js';

@Module({
  controllers: [ItemsController],
  providers: [ItemsService]
})
export class ItemsModule {}
