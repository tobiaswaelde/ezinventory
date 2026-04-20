import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module.js';
import { setupApiDocs } from './config/scalar.js';
import { validationPipe } from './config/validation.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(validationPipe);

  setupApiDocs(app);

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);
}

void bootstrap();
