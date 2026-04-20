import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { IsEmail, IsEnum, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserByAdminDto {
  @ApiProperty({ example: 'team.member@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'SuperSecurePassword123!' })
  @IsString()
  @MinLength(12)
  @MaxLength(255)
  password!: string;

  @ApiProperty({ example: 'Team Member' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  displayName!: string;

  @ApiProperty({ enum: UserRole, example: UserRole.STAFF })
  @IsEnum(UserRole)
  role!: UserRole;

  @ApiProperty({ required: false, enum: ['de', 'en'], example: 'en' })
  @IsOptional()
  @IsString()
  @IsIn(['de', 'en'])
  preferredLanguage?: 'de' | 'en';
}
