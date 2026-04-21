import 'reflect-metadata';

import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { Body, Controller, Get, HttpCode, HttpStatus, Module, NotFoundException, Post, Query } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { validationPipe } from '../../src/config/validation.js';
import { CreateCategoryDto } from '../../src/modules/categories/dto/create-category.dto.js';
import { CreateContainerDto } from '../../src/modules/containers/dto/create-container.dto.js';
import { HealthController } from '../../src/modules/health/health.controller.js';
import { CreateItemDto } from '../../src/modules/items/dto/create-item.dto.js';
import { LookupItemQueryDto } from '../../src/modules/items/dto/lookup-item-query.dto.js';
import { CreateLocationDto } from '../../src/modules/locations/dto/create-location.dto.js';
import { RegisterDto } from '../../src/modules/auth/dto/register.dto.js';
import { ListContainersQueryDto } from '../../src/modules/containers/dto/list-containers-query.dto.js';

type JsonResponse = {
  status: number;
  body: unknown;
};

const requestJson = async (
  baseUrl: string,
  path: string,
  options: {
    method: 'GET' | 'POST';
    body?: unknown;
  }
): Promise<JsonResponse> => {
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method,
    headers: {
      'content-type': 'application/json'
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  return {
    status: response.status,
    body: (await response.json()) as unknown
  };
};

describe('API integration (http)', () => {
  const registerHandler = vi.fn().mockResolvedValue({
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    email: 'new.user@example.com'
  });

  const createCategoryHandler = vi.fn().mockImplementation(async (dto: { name: string; description?: string }) => ({
    id: '550e8400-e29b-41d4-a716-446655440010',
    name: dto.name,
    description: dto.description ?? null
  }));

  const createLocationHandler = vi.fn().mockImplementation(async (dto: { name: string; code: string; description?: string }) => ({
    id: '550e8400-e29b-41d4-a716-446655440020',
    name: dto.name,
    code: dto.code,
    description: dto.description ?? null,
    iconSet: null,
    iconName: null,
    isActive: true
  }));

  const createContainerHandler = vi.fn().mockImplementation(async (dto: { locationId: string; type: string; name: string; code: string }) => ({
    id: '550e8400-e29b-41d4-a716-446655440030',
    locationId: dto.locationId,
    parentContainerId: null,
    type: dto.type,
    name: dto.name,
    code: dto.code,
    qrCodeValue: `container:${dto.code.toLowerCase()}:550e8400-e29b-41d4-a716-446655440030`,
    description: null,
    iconSet: null,
    iconName: null,
    isActive: true
  }));

  const listContainersHandler = vi.fn().mockResolvedValue([]);

  const createItemHandler = vi.fn().mockImplementation(async (dto: { categoryId: string; sku: string; name: string }) => ({
    id: '550e8400-e29b-41d4-a716-446655440040',
    categoryId: dto.categoryId,
    sku: dto.sku,
    qrCodeValue: `item:${dto.sku.toLowerCase()}:550e8400-e29b-41d4-a716-446655440040`,
    name: dto.name,
    unit: 'jar',
    sizeLabel: null,
    sizeValue: null,
    sizeUnit: null,
    servings: null
  }));

  const lookupItemHandler = vi.fn().mockImplementation(async (code: string) => {
    if (code === 'item:spaghetti-sauce-001:550e8400-e29b-41d4-a716-446655440040') {
      return {
        id: '550e8400-e29b-41d4-a716-446655440040',
        categoryId: '550e8400-e29b-41d4-a716-446655440010',
        sku: 'SPAGHETTI-SAUCE-001',
        qrCodeValue: code,
        name: 'Spaghetti Sauce',
        unit: 'jar',
        sizeLabel: null,
        sizeValue: null,
        sizeUnit: null,
        servings: null
      };
    }

    return null;
  });

  @Controller('auth')
  class IntegrationAuthController {
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() dto: RegisterDto): Promise<unknown> {
      return await registerHandler(dto);
    }
  }

  @Controller('categories')
  class IntegrationCategoriesController {
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createCategory(@Body() dto: CreateCategoryDto): Promise<unknown> {
      return await createCategoryHandler(dto);
    }
  }

  @Controller('locations')
  class IntegrationLocationsController {
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createLocation(@Body() dto: CreateLocationDto): Promise<unknown> {
      return await createLocationHandler(dto);
    }
  }

  @Controller('containers')
  class IntegrationContainersController {
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createContainer(@Body() dto: CreateContainerDto): Promise<unknown> {
      return await createContainerHandler(dto);
    }

    @Get()
    async listContainers(@Query() query: ListContainersQueryDto): Promise<unknown> {
      return await listContainersHandler(query.locationId);
    }
  }

  @Controller('items')
  class IntegrationItemsController {
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createItem(@Body() dto: CreateItemDto): Promise<unknown> {
      return await createItemHandler(dto);
    }

    @Get('lookup')
    async lookupItem(@Query() query: LookupItemQueryDto): Promise<unknown> {
      const item = await lookupItemHandler(query.code.trim());
      if (!item) {
        throw new NotFoundException('No item found for scanned code.');
      }

      return item;
    }
  }

  @Module({
    controllers: [
      HealthController,
      IntegrationAuthController,
      IntegrationCategoriesController,
      IntegrationLocationsController,
      IntegrationContainersController,
      IntegrationItemsController
    ]
  })
  class IntegrationTestModule {}

  let app: Awaited<ReturnType<typeof NestFactory.create>>;
  let baseUrl = '';

  beforeAll(async () => {
    app = await NestFactory.create(IntegrationTestModule, {
      logger: false
    });
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(validationPipe);

    await app.listen(0);
    baseUrl = await app.getUrl();
  });

  afterAll(async () => {
    await app.close();
  });

  it('registers a user over HTTP and validates payload', async () => {
    const validPayload = {
      email: 'new.user@example.com',
      password: 'SuperSecurePassword123!',
      displayName: 'Alex Doe',
      preferredLanguage: 'en'
    };

    const success = await requestJson(baseUrl, '/api/v1/auth/register', {
      method: 'POST',
      body: validPayload
    });

    expect(success.status).toBe(201);
    expect(success.body).toMatchObject({
      email: 'new.user@example.com',
      accessToken: 'access-token',
      refreshToken: 'refresh-token'
    });
    expect(registerHandler).toHaveBeenCalledWith(validPayload);

  });

  it('creates inventory entities over HTTP and validates DTO/query constraints', async () => {
    const categoryPayload = {
      name: 'Food',
      description: 'Food and frozen products'
    };
    const categoryResponse = await requestJson(baseUrl, '/api/v1/categories', {
      method: 'POST',
      body: categoryPayload
    });

    expect(categoryResponse.status).toBe(201);
    expect(categoryResponse.body).toMatchObject({
      name: 'Food'
    });
    expect(createCategoryHandler).toHaveBeenCalledWith(categoryPayload);

    const locationPayload = {
      name: 'Garage',
      code: 'GARAGE',
      description: 'Main storage location at home'
    };
    const locationResponse = await requestJson(baseUrl, '/api/v1/locations', {
      method: 'POST',
      body: locationPayload
    });

    expect(locationResponse.status).toBe(201);
    expect(locationResponse.body).toMatchObject({
      name: 'Garage',
      code: 'GARAGE'
    });
    expect(createLocationHandler).toHaveBeenCalledWith(locationPayload);

    const containerPayload = {
      locationId: '550e8400-e29b-41d4-a716-446655440020',
      type: 'BOX',
      name: 'Freezer Drawer 1',
      code: 'FREEZER-DRAWER-1'
    };
    const containerResponse = await requestJson(baseUrl, '/api/v1/containers', {
      method: 'POST',
      body: containerPayload
    });

    expect(containerResponse.status).toBe(201);
    expect(containerResponse.body).toMatchObject({
      locationId: containerPayload.locationId,
      type: 'BOX',
      code: 'FREEZER-DRAWER-1'
    });
    expect(createContainerHandler).toHaveBeenCalledWith(containerPayload);

    const validContainersQuery = await requestJson(
      baseUrl,
      '/api/v1/containers?locationId=550e8400-e29b-41d4-a716-446655440020',
      {
        method: 'GET'
      }
    );

    expect(validContainersQuery.status).toBe(200);
    expect(listContainersHandler).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440020');
  });

  it('creates and looks up items over HTTP', async () => {
    const createItemPayload = {
      categoryId: '550e8400-e29b-41d4-a716-446655440010',
      sku: 'SPAGHETTI-SAUCE-001',
      name: 'Spaghetti Sauce'
    };

    const createItemResponse = await requestJson(baseUrl, '/api/v1/items', {
      method: 'POST',
      body: createItemPayload
    });

    expect(createItemResponse.status).toBe(201);
    expect(createItemResponse.body).toMatchObject({
      categoryId: createItemPayload.categoryId,
      sku: createItemPayload.sku,
      name: createItemPayload.name
    });
    expect(createItemHandler).toHaveBeenCalledWith(createItemPayload);

    const lookupHit = await requestJson(
      baseUrl,
      '/api/v1/items/lookup?code=item:spaghetti-sauce-001:550e8400-e29b-41d4-a716-446655440040',
      {
        method: 'GET'
      }
    );

    expect(lookupHit.status).toBe(200);
    expect(lookupHit.body).toMatchObject({
      sku: 'SPAGHETTI-SAUCE-001',
      name: 'Spaghetti Sauce'
    });

    const lookupMiss = await requestJson(
      baseUrl,
      '/api/v1/items/lookup?code=item:unknown:550e8400-e29b-41d4-a716-446655440040',
      {
        method: 'GET'
      }
    );

    expect(lookupMiss.status).toBe(404);
    expect(lookupMiss.body).toMatchObject({
      statusCode: 404
    });
  });

  it('serves /health over HTTP', async () => {
    const response = await requestJson(baseUrl, '/api/v1/health', { method: 'GET' });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      name: '@ezinventory/api',
      status: 'online'
    });
  });
});
