import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { INestApplication } from '@nestjs/common';
import type { Express } from 'express';

export function setupApiDocs(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('EZ Inventory API')
    .setDescription('API specification for EZ Inventory')
    .setVersion('0.1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/openapi', app, document);

  const expressApp = app.getHttpAdapter().getInstance() as Express;

  expressApp.get('/api/openapi.json', (_req, res) => {
    res.json(document);
  });

  expressApp.get('/api/docs', (_req, res) => {
    res.type('html').send(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>EZ Inventory API Docs</title>
  </head>
  <body>
    <script id="api-reference" data-url="/api/openapi.json"></script>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
  </body>
</html>`);
  });
}
