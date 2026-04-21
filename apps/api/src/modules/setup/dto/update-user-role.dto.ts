import { ApiProperty } from '@nestjs/swagger';
import prismaClient from '@prisma/client';
import type { UserRole as UserRoleType } from '@prisma/client';
import { IsEnum } from 'class-validator';

const { UserRole } = prismaClient as typeof import('@prisma/client');

export class UpdateUserRoleDto {
  @ApiProperty({ enum: UserRole, example: UserRole.MANAGER })
  @IsEnum(UserRole)
  role!: UserRoleType;
}
