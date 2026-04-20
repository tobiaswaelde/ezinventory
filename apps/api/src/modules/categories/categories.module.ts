import { Module } from '@nestjs/common';

import { AuthModule } from '~/modules/auth/auth.module.js';
import { CategoriesController } from '~/modules/categories/categories.controller.js';
import { CategoriesService } from '~/modules/categories/categories.service.js';

@Module({
  imports: [AuthModule],
  controllers: [CategoriesController],
  providers: [CategoriesService]
})
export class CategoriesModule {}
