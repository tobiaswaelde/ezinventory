import 'reflect-metadata';

import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { Body, Controller, Get, Module, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { validationPipe } from '../../src/config/validation.js';
import { HealthController } from '../../src/modules/health/health.controller.js';

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
  const createItemHandler = vi.fn().mockImplementation(async (dto: { categoryId: string; sku: string; name: string }) => {
    return {
      id: '550e8400-e29b-41d4-a716-446655440000',
      categoryId: dto.categoryId,
      sku: dto.sku,
      qrCodeValue: `item:${dto.sku}:550e8400-e29b-41d4-a716-446655440000`,
      name: dto.name,
      unit: 'jar',
      sizeLabel: null,
      sizeValue: null,
      sizeUnit: null,
      servings: null
    };
  });

  @Controller('items')
  class IntegrationItemsController {
    @Post()
    async create(@Body() dto: { categoryId: string; sku: string; name: string }): Promise<unknown> {
      return await createItemHandler(dto);
    }

    @Get(':id')
    async byId(@Param('id', new ParseUUIDPipe()) id: string): Promise<{ id: string }> {
      return { id };
    }
  }

  @Module({
    controllers: [HealthController, IntegrationItemsController]
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

  it('serves /health over HTTP', async () => {
    const response = await requestJson(baseUrl, '/api/v1/health', { method: 'GET' });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      name: '@ezinventory/api',
      status: 'online'
    });
  });

  it('enforces UUID validation in route params over HTTP', async () => {
    const response = await requestJson(baseUrl, '/api/v1/items/not-a-uuid', {
      method: 'GET'
    });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ message: expect.stringContaining('uuid') });
  });

  it('accepts valid /items payload and calls service', async () => {
    const payload = {
      categoryId: '550e8400-e29b-41d4-a716-446655440001',
      sku: 'SPAGHETTI-SAUCE-001',
      name: 'Spaghetti Sauce'
    };

    const response = await requestJson(baseUrl, '/api/v1/items', {
      method: 'POST',
      body: payload
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      categoryId: payload.categoryId,
      sku: payload.sku,
      name: payload.name
    });
    expect(createItemHandler).toHaveBeenCalledWith(payload);
  });
});
