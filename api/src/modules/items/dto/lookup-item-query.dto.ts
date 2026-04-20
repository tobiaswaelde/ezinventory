import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class LookupItemQueryDto {
  @ApiProperty({ example: 'item:spaghetti-sauce-001:550e8400-e29b-41d4-a716-446655440000' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  code!: string;
}
