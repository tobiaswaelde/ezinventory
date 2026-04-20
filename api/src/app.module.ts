import { Module } from '@nestjs/common';

import { HealthModule } from './modules/health/health.module.js';
import { ItemsModule } from './modules/items/items.module.js';
import { PrismaModule } from './prisma/prisma.module.js';

@Module({
  imports: [PrismaModule, HealthModule, ItemsModule]
})
export class AppModule {}
