import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export function ApiPropertyUpdatedAt(): PropertyDecorator {
  return applyDecorators(ApiProperty({ description: 'The updated date of the item.' }));
}
