import { Body, Controller, Get, HttpCode, HttpStatus, Inject, NotFoundException, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { CheckPolicies } from '~/modules/auth/casl/check-policies.decorator.js';
import { AccessTokenGuard } from '~/modules/auth/guards/access-token.guard.js';
import { PoliciesGuard } from '~/modules/auth/guards/policies.guard.js';
import { CreateItemDto } from '~/modules/items/dto/create-item.dto.js';
import { LookupItemQueryDto } from '~/modules/items/dto/lookup-item-query.dto.js';
import { type ItemResponse, ItemsService } from '~/modules/items/items.service.js';

@ApiTags('items')
@Controller('items')
@UseGuards(AccessTokenGuard, PoliciesGuard)
@ApiBearerAuth('bearer')
export class ItemsController {
  constructor(@Inject(ItemsService) private readonly itemsService: ItemsService) {}

  @Post()
  @CheckPolicies({ action: 'create', subject: 'Item' })
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
        categoryId: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440001' },
        sku: { type: 'string', example: 'SPAGHETTI-SAUCE-001' },
        qrCodeValue: { type: 'string', example: 'item:spaghetti-sauce-001:550e8400-e29b-41d4-a716-446655440000' },
        name: { type: 'string', example: 'Spaghetti Sauce' },
        unit: { type: 'string', example: 'jar' },
        sizeLabel: { type: 'string', nullable: true, example: 'Portion Pack' },
        sizeValue: { type: 'number', nullable: true, example: 1.5 },
        sizeUnit: { type: 'string', nullable: true, example: 'L' },
        servings: { type: 'number', nullable: true, example: 3 }
      }
    }
  })
  async createItem(@Body() dto: CreateItemDto): Promise<ItemResponse> {
    return await this.itemsService.createItem(dto);
  }

  @Get()
  @CheckPolicies({ action: 'read', subject: 'Item' })
  @ApiOkResponse({
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          categoryId: { type: 'string', format: 'uuid' },
          sku: { type: 'string' },
          qrCodeValue: { type: 'string' },
          name: { type: 'string' },
          unit: { type: 'string' },
          sizeLabel: { type: 'string', nullable: true },
          sizeValue: { type: 'number', nullable: true },
          sizeUnit: { type: 'string', nullable: true },
          servings: { type: 'number', nullable: true }
        }
      }
    }
  })
  async listItems(): Promise<ItemResponse[]> {
    return await this.itemsService.listItems();
  }

  @Get('lookup')
  @CheckPolicies({ action: 'read', subject: 'Item' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        categoryId: { type: 'string', format: 'uuid' },
        sku: { type: 'string' },
        qrCodeValue: { type: 'string' },
        name: { type: 'string' },
        unit: { type: 'string' },
        sizeLabel: { type: 'string', nullable: true },
        sizeValue: { type: 'number', nullable: true },
        sizeUnit: { type: 'string', nullable: true },
        servings: { type: 'number', nullable: true }
      }
    }
  })
  async lookupItem(@Query() query: LookupItemQueryDto): Promise<ItemResponse> {
    const item = await this.itemsService.lookupByCode(query.code.trim());

    if (!item) {
      throw new NotFoundException('No item found for scanned code.');
    }

    return item;
  }
}
