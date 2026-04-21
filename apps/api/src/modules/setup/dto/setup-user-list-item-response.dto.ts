import { ApiPropertyOptional } from '@nestjs/swagger';
import type { UserRole as UserRoleType } from '@prisma/client';
import { Expose } from 'class-transformer';

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
