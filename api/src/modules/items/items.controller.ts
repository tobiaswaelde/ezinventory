import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { CreateItemDto } from '~/modules/items/dto/create-item.dto.js';
import { ItemsService } from '~/modules/items/items.service.js';

@ApiTags('items')
@Controller('items')
export class ItemsController {
  constructor(@Inject(ItemsService) private readonly itemsService: ItemsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
        categoryId: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440001' },
        sku: { type: 'string', example: 'SPAGHETTI-SAUCE-001' },
        name: { type: 'string', example: 'Spaghetti Sauce' },
        servings: { type: 'number', nullable: true, example: 3 }
      }
    }
  })
  async createItem(
    @Body() dto: CreateItemDto
  ): Promise<{ id: string; categoryId: string; sku: string; name: string; servings: number | null }> {
    return await this.itemsService.createItem(dto);
  }

  @Get()
  @ApiOkResponse({
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          categoryId: { type: 'string', format: 'uuid' },
          sku: { type: 'string' },
          name: { type: 'string' },
          servings: { type: 'number', nullable: true }
        }
      }
    }
  })
  async listItems(): Promise<Array<{ id: string; categoryId: string; sku: string; name: string; servings: number | null }>> {
    return await this.itemsService.listItems();
  }
}
