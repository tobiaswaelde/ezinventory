import { ApiProperty } from '@nestjs/swagger';
import prismaClient from '@prisma/client';
import type { UserRole as UserRoleType } from '@prisma/client';
import { IsEmail, IsEnum, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

const { UserRole } = prismaClient as typeof import('@prisma/client');

export class CreateUserByAdminDto {
  @ApiProperty({ example: 'team.member@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'SuperSecurePassword123!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(12)
  @MaxLength(255)
  password!: string;

  @ApiProperty({ example: 'Team Member' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(120)
  displayName!: string;

  @ApiProperty({ enum: UserRole, example: UserRole.STAFF })
  @IsEnum(UserRole)
  role!: UserRoleType;

  @ApiProperty({ required: false, enum: ['de', 'en'], example: 'en' })
  @IsOptional()
  @IsString()
  @IsIn(['de', 'en'])
  preferredLanguage?: 'de' | 'en';
}
