import { Module } from '@nestjs/common';

import { ItemsController } from './items.controller.js';

@Module({
  controllers: [ItemsController]
})
export class ItemsModule {}
