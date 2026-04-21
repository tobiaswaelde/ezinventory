import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import type { UserRole as UserRoleType } from '@prisma/client';

import type { CaslAction, CaslSubject } from '~/modules/auth/casl/casl-ability.types.js';
import { RegistrationMode } from '~/modules/setup/dto/update-registration-mode.dto.js';

export class SetupStatusResponseDto {
  @Expose()
  @ApiProperty({ example: true })
  setupInitialized!: boolean;

  @Expose()
  @ApiProperty({ enum: RegistrationMode })
  registrationMode!: RegistrationMode;

  constructor(partial: Partial<SetupStatusResponseDto>) {
    Object.assign(this, partial);
  }

  static fromModel(model: { setupInitialized: boolean; registrationMode: RegistrationMode }): SetupStatusResponseDto {
    return new SetupStatusResponseDto(model);
  }
}

export class BootstrapAdminResponseDto {
  @Expose()
  @ApiProperty({ example: true })
  setupInitialized!: true;

  @Expose()
  @ApiProperty({ format: 'uuid' })
  adminUserId!: string;

  @Expose()
  @ApiProperty()
  email!: string;

  constructor(partial: Partial<BootstrapAdminResponseDto>) {
    Object.assign(this, partial);
  }

  static fromModel(model: { setupInitialized: true; adminUserId: string; email: string }): BootstrapAdminResponseDto {
    return new BootstrapAdminResponseDto(model);
  }
}

export class RegistrationModeResponseDto {
  @Expose()
  @ApiProperty({ enum: RegistrationMode })
  mode!: RegistrationMode;

  constructor(partial: Partial<RegistrationModeResponseDto>) {
    Object.assign(this, partial);
  }

  static fromModel(model: { mode: RegistrationMode }): RegistrationModeResponseDto {
    return new RegistrationModeResponseDto(model);
  }
}

export class AdminUserResponseDto {
  @Expose()
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @Expose()
  @ApiProperty()
  email!: string;

  @Expose()
  @ApiProperty()
  role!: UserRoleType;

  constructor(partial: Partial<AdminUserResponseDto>) {
    Object.assign(this, partial);
  }

  static fromModel(model: { id: string; email: string; role: UserRoleType }): AdminUserResponseDto {
    return new AdminUserResponseDto(model);
  }
}

export class SetupUserListItemResponseDto {
  @Expose()
  @ApiPropertyOptional({ format: 'uuid' })
  id?: string;

  @Expose()
  @ApiPropertyOptional()
  email?: string;

  @Expose()
  @ApiPropertyOptional()
  displayName?: string;

  @Expose()
  @ApiPropertyOptional()
  role?: UserRoleType;

  @Expose()
  @ApiPropertyOptional()
  preferredLanguage?: string;

  @Expose()
  @ApiPropertyOptional({ format: 'date-time' })
  createdAt?: Date;

  @Expose()
  @ApiPropertyOptional({ format: 'date-time' })
  updatedAt?: Date;

  @Expose()
  @ApiPropertyOptional({ type: [String] })
  policyIds?: string[];

  constructor(partial: Partial<SetupUserListItemResponseDto>) {
    Object.assign(this, partial);
  }

  static fromModel(model: Record<string, unknown>): SetupUserListItemResponseDto {
    return new SetupUserListItemResponseDto(model);
  }

  static fromModels(models: Array<Record<string, unknown>>): SetupUserListItemResponseDto[] {
    return models.map((model) => SetupUserListItemResponseDto.fromModel(model));
  }
}

export class UpdateUserRoleResponseDto {
  @Expose()
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @Expose()
  @ApiProperty()
  role!: UserRoleType;

  constructor(partial: Partial<UpdateUserRoleResponseDto>) {
    Object.assign(this, partial);
  }

  static fromModel(model: { id: string; role: UserRoleType }): UpdateUserRoleResponseDto {
    return new UpdateUserRoleResponseDto(model);
  }
}

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

export class ReplaceUserPoliciesResponseDto {
  @Expose()
  @ApiProperty({ format: 'uuid' })
  userId!: string;

  @Expose()
  @ApiProperty({ type: [String] })
  policyIds!: string[];

  constructor(partial: Partial<ReplaceUserPoliciesResponseDto>) {
    Object.assign(this, partial);
  }

  static fromModel(model: { userId: string; policyIds: string[] }): ReplaceUserPoliciesResponseDto {
    return new ReplaceUserPoliciesResponseDto(model);
  }
}
