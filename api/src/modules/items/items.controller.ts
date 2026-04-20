import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';

import { CreateItemDto } from './dto/create-item.dto.js';

@ApiTags('items')
@Controller('items')
export class ItemsController {
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
        sku: { type: 'string', example: 'SPAGHETTI-SAUCE-001' },
        name: { type: 'string', example: 'Spaghetti Sauce' },
        servings: { type: 'number', example: 3 }
      }
    }
  })
  createItem(@Body() dto: CreateItemDto): CreateItemDto & { id: string } {
    return {
      id: crypto.randomUUID(),
      ...dto
    };
  }
}
