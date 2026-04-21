import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';

import { AppModule } from '~/app.module.js';
import { ENV } from '~/config/env.js';
import { setupApiDocs } from '~/config/scalar.js';
import { validationPipe } from '~/config/validation.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const corsOrigin = ENV.CORS_ORIGIN.trim();

  app.setGlobalPrefix('api/v1');
  app.enableCors({
    origin:
      corsOrigin === '*'
        ? '*'
        : corsOrigin
            .split(',')
            .map((origin) => origin.trim())
            .filter(Boolean),
    credentials: corsOrigin !== '*'
  });
  app.useGlobalPipes(validationPipe);

  setupApiDocs(app);

  await app.listen(ENV.PORT);
}

void bootstrap();
