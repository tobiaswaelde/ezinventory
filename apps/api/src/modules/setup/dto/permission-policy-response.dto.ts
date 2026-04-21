import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import type { CaslAction, CaslSubject } from '~/modules/auth/casl/casl-ability.types.js';

export class PermissionPolicyResponseDto {
  @Expose()
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @Expose()
  @ApiProperty()
  action!: CaslAction;

  @Expose()
  @ApiProperty()
  subject!: CaslSubject;

  @Expose()
  @ApiProperty()
  inverted!: boolean;

  @Expose()
  @ApiProperty({ nullable: true })
  conditions!: unknown;

  @Expose()
  @ApiProperty({ nullable: true })
  reason!: string | null;

  @Expose()
  @ApiProperty({ format: 'date-time' })
  createdAt!: Date;

  constructor(partial: Partial<PermissionPolicyResponseDto>) {
    Object.assign(this, partial);
  }

  static fromModel(model: {
    id: string;
    action: CaslAction;
    subject: CaslSubject;
    inverted: boolean;
    conditions: unknown;
    reason: string | null;
    createdAt: Date;
  }): PermissionPolicyResponseDto {
    return new PermissionPolicyResponseDto(model);
  }

  static fromModels(
    models: Array<{
      id: string;
      action: CaslAction;
      subject: CaslSubject;
      inverted: boolean;
      conditions: unknown;
      reason: string | null;
      createdAt: Date;
    }>
  ): PermissionPolicyResponseDto[] {
    return models.map((model) => PermissionPolicyResponseDto.fromModel(model));
  }
}
