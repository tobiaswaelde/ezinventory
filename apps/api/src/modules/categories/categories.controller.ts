import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse
} from '@nestjs/swagger';

import { CheckPolicies } from '~/modules/auth/casl/check-policies.decorator.js';
import { AccessTokenGuard } from '~/modules/auth/guards/access-token.guard.js';
import { PoliciesGuard } from '~/modules/auth/guards/policies.guard.js';
import { CategoryResponseDto } from '~/modules/categories/dto/category-response.dto.js';
import { CategoriesService } from '~/modules/categories/categories.service.js';
import { CreateCategoryDto } from '~/modules/categories/dto/create-category.dto.js';

@ApiTags('categories')
@Controller('categories')
@UseGuards(AccessTokenGuard, PoliciesGuard)
@ApiBearerAuth('bearer')
export class CategoriesController {
  constructor(@Inject(CategoriesService) private readonly categoriesService: CategoriesService) {}

  @Post()
  @CheckPolicies({ action: 'create', subject: 'Category' })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new category' })
  @ApiCreatedResponse({ type: CategoryResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed for category payload.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({ description: 'Insufficient permission to create categories.' })
  async createCategory(@Body() dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    const created = await this.categoriesService.createCategory(dto);
    return CategoryResponseDto.fromModel(created);
  }

  @Get()
  @CheckPolicies({ action: 'read', subject: 'Category' })
  @ApiOperation({ summary: 'List all categories' })
  @ApiOkResponse({ type: CategoryResponseDto, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({ description: 'Insufficient permission to read categories.' })
  async listCategories(): Promise<CategoryResponseDto[]> {
    const items = await this.categoriesService.listCategories();
    return CategoryResponseDto.fromModels(items);
  }
}
