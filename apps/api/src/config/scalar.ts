import { type INestApplication } from '@nestjs/common';
import { DocumentBuilder, type SwaggerDocumentOptions, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

import { ApiAuth, ApiTag } from './api';
import { ENV } from './env';

/**
 * Swagger document options
 */
export const swaggerDocumentOptions: SwaggerDocumentOptions = {};

export const swaggerConfig = new DocumentBuilder()
  // set basic info
  .setTitle('CRM Tenant API Test')
  .setDescription(process.env.npm_package_description || 'API')
  .setVersion(process.env.npm_package_version || '0.0.0')
  // add server info
  .addServer(ENV.API_BASE_URL, 'Development')
  .addServer('https://api.domain.com', 'Production')
  // add authentication methods
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Enter JWT token',
    },
    ApiAuth.JWT,
  )
  // add api tag descriptions
  .addTag(ApiTag.Health, 'Health check')
  // build the document
  .build();

export function setupApiDocs(app: INestApplication): void {
  const document = SwaggerModule.createDocument(app, swaggerConfig, swaggerDocumentOptions);

  app.use(
    '/docs',
    apiReference({
      content: document,
      theme: 'saturn',
      hideClientButton: true,
      telemetry: false,
      persistAuth: true,
      showDeveloperTools: 'never',
      agent: {
        disabled: true,
      },
      defaultHttpClient: {
        targetKey: 'node',
        clientKey: 'axios',
      },
      metaData: {
        title: 'CRM Tenant API',
      },
    }),
  );
}
