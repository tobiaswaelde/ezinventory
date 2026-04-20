import 'reflect-metadata';

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { NestFactory } from '@nestjs/core';

import { AppModule } from '~/app.module.js';
import { createOpenApiDocument } from '~/config/scalar.js';
import { validationPipe } from '~/config/validation.js';

async function exportOpenApi(): Promise<void> {
  const app = await NestFactory.create(AppModule, { logger: false });

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(validationPipe);

  const document = createOpenApiDocument(app);
  const outputPath = path.resolve(process.cwd(), '../../packages/contracts/openapi/ezinventory.openapi.json');

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(document, null, 2)}\n`, 'utf8');
  await app.close();

  console.log(`OpenAPI spec exported to ${outputPath}`);
}

void exportOpenApi();
