import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export function ApiPropertyCreatedAt(): PropertyDecorator {
  return applyDecorators(ApiProperty({ description: 'The creation date of the item.' }));
}
