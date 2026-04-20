import { Module } from '@nestjs/common';

import { CategoriesController } from '~/modules/categories/categories.controller.js';
import { CategoriesService } from '~/modules/categories/categories.service.js';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService]
})
export class CategoriesModule {}
