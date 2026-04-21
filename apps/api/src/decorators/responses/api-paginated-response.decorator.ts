import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiResponseExamples, getSchemaPath } from '@nestjs/swagger';

import { PageMetaDto } from '~/types/pagination/page-meta.dto.js';

export type ApiPaginatedResponseOptions<T> = {
  model: new (...args: any) => T;
  description?: string;
  examples?: {
    [key: string]: ApiResponseExamples;
  };
};

export function ApiPaginatedResponse<TModel>(options: ApiPaginatedResponseOptions<TModel>) {
  return applyDecorators(
    ApiOkResponse({
      examples: options.examples,
      description: options.description ?? 'Paginated items',
      schema: {
        description: options.description ?? 'Paginated items',
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: { $ref: getSchemaPath(options.model) }
          },
          meta: {
            type: 'object',
            $ref: getSchemaPath(PageMetaDto)
          }
        }
      }
    })
  );
}
