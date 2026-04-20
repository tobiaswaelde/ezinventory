import { Module } from '@nestjs/common';

import { AuthModule } from '~/modules/auth/auth.module.js';
import { CategoriesModule } from '~/modules/categories/categories.module.js';
import { HealthModule } from '~/modules/health/health.module.js';
import { ItemsModule } from '~/modules/items/items.module.js';
import { SetupModule } from '~/modules/setup/setup.module.js';
import { PrismaModule } from '~/prisma/prisma.module.js';

@Module({
  imports: [PrismaModule, HealthModule, CategoriesModule, ItemsModule, SetupModule, AuthModule]
})
export class AppModule {}
