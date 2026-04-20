import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsIn, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

import { CASL_ACTIONS, CASL_SUBJECTS, type CaslAction, type CaslSubject } from '~/modules/auth/casl/casl-ability.types.js';

export class CreatePermissionPolicyDto {
  @ApiProperty({ enum: CASL_ACTIONS, example: 'read' })
  @IsIn(CASL_ACTIONS)
  action!: CaslAction;

  @ApiProperty({ enum: CASL_SUBJECTS, example: 'Item' })
  @IsIn(CASL_SUBJECTS)
  subject!: CaslSubject;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true, example: { id: { $eq: '550e8400-e29b-41d4-a716-446655440001' } } })
  @IsOptional()
  @IsObject()
  conditions?: Record<string, unknown>;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  inverted?: boolean;

  @ApiPropertyOptional({ example: 'Temporary access for stock-taking' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  reason?: string;
}
