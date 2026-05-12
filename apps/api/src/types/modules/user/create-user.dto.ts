import { UserRole } from '@/generated/prisma/enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNotEmptyObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { CreateUserPreferencesDTO } from '~/types/modules/user-preferences/create-user-preferences.dto';
import { CreateUserProfileDTO } from '~/types/modules/user-profile/create-user-profile.dto';

export class CreateUserDTO {
  @ApiProperty({ example: 'user@domain.com' })
  @IsString()
  @IsEmail()
  @MaxLength(255)
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'some-password' })
  @IsString()
  @MaxLength(72)
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({ enum: UserRole })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiProperty({ type: () => CreateUserProfileDTO })
  @ValidateNested()
  @Type(() => CreateUserProfileDTO)
  @IsNotEmptyObject()
  profile: CreateUserProfileDTO;

  @ApiProperty({ type: () => CreateUserPreferencesDTO })
  @ValidateNested()
  @Type(() => CreateUserPreferencesDTO)
  @IsNotEmptyObject()
  preferences: CreateUserPreferencesDTO;
}
