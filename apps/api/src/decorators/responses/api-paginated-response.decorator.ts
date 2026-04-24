import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiResponseExamples, getSchemaPath } from '@nestjs/swagger';
import { LinksObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { PageMetaDTO } from '~/types/pagination/page-meta.dto';

export type ApiPaginatedResponseOptions<T> = {
  model: new (...args: any) => T;
  description?: string;
  links?: LinksObject;
  exampl?: any;
  examples?: {
    [key: string]: ApiResponseExamples;
  };
};

export function ApiPaginatedResponse<TModel>(options?: ApiPaginatedResponseOptions<TModel>) {
  return applyDecorators(
    ApiOkResponse({
      ...options,
      description: options.description ?? 'Paginated items',
      schema: {
        description: options.description ?? 'Paginated items',
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: { $ref: getSchemaPath(options.model) },
          },
          meta: {
            type: 'object',
            $ref: getSchemaPath(PageMetaDTO),
          },
        },
      },
    }),
  );
}
