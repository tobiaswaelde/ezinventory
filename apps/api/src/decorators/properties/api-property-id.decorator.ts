import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export function ApiPropertyId(): PropertyDecorator {
  return applyDecorators(
    ApiProperty({ example: crypto.randomUUID(), description: 'The ID of the item.' }),
  );
}
