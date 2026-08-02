import { ClassSerializerInterceptor, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { EmptyStringToNullPipe, FieldsExceptionFilter, QueryTransformPipe } from '@querry-kit/nest';
import { AppModule } from '~/app.module';
import { appLogger, appOptions } from '~/config/app';
import { ENV } from '~/config/env';
import { setupApiDocs } from '~/config/scalar';
import { serializationOptions } from '~/config/serialization';
import { validationOptions } from '~/config/validation';
import { PrismaExceptionFilter } from '~/prisma/prisma-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, appOptions);

  app.set('trust proxy', true);
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  app.getHttpAdapter().getInstance().disable('x-powered-by');
  app.setGlobalPrefix('/api');
  app.enableShutdownHooks();

  app.enableCors({ origin: ENV.CORS_ORIGIN, allowedHeaders: ['*'] });

  app.useGlobalPipes(
    new QueryTransformPipe(), // parse query string
    new EmptyStringToNullPipe(), // normalize empty body strings to null
    new ValidationPipe(validationOptions), // validate incoming data
  );
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), serializationOptions),
  );
  app.useGlobalFilters(new FieldsExceptionFilter(), new PrismaExceptionFilter());

  setupApiDocs(app);

  await app.listen(ENV.PORT);
  appLogger.log(`Application is running on: ${await app.getUrl()}`);
}

void bootstrap();
