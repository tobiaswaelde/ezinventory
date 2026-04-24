import { applyDecorators } from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';

export function ApiParamId(options: { name?: string; description?: string }): MethodDecorator {
  return applyDecorators(
    ApiParam({
      name: options.name || 'id',
      description: options.description,
      type: 'string',
      format: 'uuid',
    }),
  );
}
