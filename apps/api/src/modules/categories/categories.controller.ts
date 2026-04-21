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
  @ApiBadRequestResponse({ description: 'Validation failed for category payload.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({ description: 'Insufficient permission to create categories.' })
  async createCategory(@Body() dto: CreateCategoryDto): Promise<{ id: string; name: string; description: string | null }> {
    return await this.categoriesService.createCategory(dto);
  }

  @Get()
  @CheckPolicies({ action: 'read', subject: 'Category' })
  @ApiOperation({ summary: 'List all categories' })
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
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({ description: 'Insufficient permission to read categories.' })
  async listCategories(): Promise<Array<{ id: string; name: string; description: string | null }>> {
    return await this.categoriesService.listCategories();
  }
}
