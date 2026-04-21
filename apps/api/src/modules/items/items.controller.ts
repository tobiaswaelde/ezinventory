import { Body, Controller, Get, HttpCode, HttpStatus, Inject, NotFoundException, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse
} from '@nestjs/swagger';

import { CheckPolicies } from '~/modules/auth/casl/check-policies.decorator.js';
import { AccessTokenGuard } from '~/modules/auth/guards/access-token.guard.js';
import { PoliciesGuard } from '~/modules/auth/guards/policies.guard.js';
import { CreateItemDto } from '~/modules/items/dto/create-item.dto.js';
import { ItemResponseDto } from '~/modules/items/dto/item-response.dto.js';
import { LookupItemQueryDto } from '~/modules/items/dto/lookup-item-query.dto.js';
import { ItemsService } from '~/modules/items/items.service.js';

@ApiTags('items')
@Controller('items')
@UseGuards(AccessTokenGuard, PoliciesGuard)
@ApiBearerAuth('bearer')
export class ItemsController {
  constructor(@Inject(ItemsService) private readonly itemsService: ItemsService) {}

  @Post()
  @CheckPolicies({ action: 'create', subject: 'Item' })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new inventory item' })
  @ApiCreatedResponse({ type: ItemResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed for item payload.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({ description: 'Insufficient permission to create items.' })
  async createItem(@Body() dto: CreateItemDto): Promise<ItemResponseDto> {
    const created = await this.itemsService.createItem(dto);
    return ItemResponseDto.fromModel(created);
  }

  @Get()
  @CheckPolicies({ action: 'read', subject: 'Item' })
  @ApiOperation({ summary: 'List all inventory items' })
  @ApiOkResponse({ type: ItemResponseDto, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({ description: 'Insufficient permission to read items.' })
  async listItems(): Promise<ItemResponseDto[]> {
    const items = await this.itemsService.listItems();
    return ItemResponseDto.fromModels(items);
  }

  @Get('lookup')
  @CheckPolicies({ action: 'read', subject: 'Item' })
  @ApiOperation({ summary: 'Lookup a single item by scanned code' })
  @ApiOkResponse({ type: ItemResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid or missing lookup code.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({ description: 'Insufficient permission to read items.' })
  @ApiNotFoundResponse({ description: 'No item found for scanned code.' })
  async lookupItem(@Query() query: LookupItemQueryDto): Promise<ItemResponseDto> {
    const item = await this.itemsService.lookupByCode(query.code.trim());

    if (!item) {
      throw new NotFoundException('No item found for scanned code.');
    }

    return ItemResponseDto.fromModel(item);
  }
}
