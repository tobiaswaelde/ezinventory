import prismaClient from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

const { UserRole } = prismaClient as typeof import('@prisma/client');

export const USER_SORTABLE_FIELDS = ['displayName', 'email', 'createdAt', 'updatedAt', 'role'] as const;
export type UserSortableField = (typeof USER_SORTABLE_FIELDS)[number];

export class ListUsersQueryDto {
  @ApiPropertyOptional({
    description:
      'Comma-separated projection fields. Allowed: id,email,displayName,role,preferredLanguage,createdAt,updatedAt,policyIds',
    example: 'id,email,displayName,role,policyIds'
  })
  @IsOptional()
  @IsString()
  fields?: string;

  @ApiPropertyOptional({
    description: 'Case-insensitive text search across displayName and email.',
    example: 'alex'
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: Object.values(UserRole),
    description: 'Optional role filter.'
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: (typeof UserRole)[keyof typeof UserRole];

  @ApiPropertyOptional({
    enum: USER_SORTABLE_FIELDS,
    description: 'Sort field for user listing.',
    example: 'createdAt'
  })
  @IsOptional()
  @IsEnum(USER_SORTABLE_FIELDS)
  sortBy?: UserSortableField;

  @ApiPropertyOptional({
    enum: ['asc', 'desc'],
    description: 'Sort direction.',
    example: 'asc'
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortDir?: 'asc' | 'desc';
}
