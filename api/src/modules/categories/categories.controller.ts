import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { CategoriesService } from './categories.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(@Inject(CategoriesService) private readonly categoriesService: CategoriesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440123' },
        name: { type: 'string', example: 'Food' },
        description: { type: 'string', nullable: true, example: 'Food and frozen products' }
      }
    }
  })
  async createCategory(@Body() dto: CreateCategoryDto): Promise<{ id: string; name: string; description: string | null }> {
    return await this.categoriesService.createCategory(dto);
  }

  @Get()
  @ApiOkResponse({
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          description: { type: 'string', nullable: true }
        }
      }
    }
  })
  async listCategories(): Promise<Array<{ id: string; name: string; description: string | null }>> {
    return await this.categoriesService.listCategories();
  }
}
