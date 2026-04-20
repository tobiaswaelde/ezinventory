import type { INestApplication } from '@nestjs/common';
import { apiReference } from '@scalar/nestjs-api-reference';
import { DocumentBuilder, SwaggerModule, type OpenAPIObject } from '@nestjs/swagger';

export function createOpenApiDocument(app: INestApplication): OpenAPIObject {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('EZ Inventory API')
    .setDescription('API specification for EZ Inventory')
    .setVersion('0.1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT access token'
      },
      'bearer'
    )
    .build();

  return SwaggerModule.createDocument(app, swaggerConfig);
}

export function setupApiDocs(app: INestApplication): void {
  const document = createOpenApiDocument(app);

  app.use(
    '/docs',
    apiReference({
      content: document,
      theme: 'saturn',
      hideClientButton: true,
      telemetry: false,
      persistAuth: true,
      expandAllResponses: true,
      showDeveloperTools: 'never',
      defaultHttpClient: {
        targetKey: 'node',
        clientKey: 'axios'
      },
      metaData: {
        title: 'EZ Inventory API'
      },
      tagsSorter: 'alpha'
    })
  );

  // Keep a stable JSON endpoint for contract generation and tooling.
  app.getHttpAdapter().get('/api/openapi.json', (_req, res) => {
    res.json(document);
  });
}
