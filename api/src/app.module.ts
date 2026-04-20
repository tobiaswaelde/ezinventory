import { Module } from '@nestjs/common';

import { HealthModule } from './modules/health/health.module.js';
import { ItemsModule } from './modules/items/items.module.js';

@Module({
  imports: [HealthModule, ItemsModule]
})
export class AppModule {}
