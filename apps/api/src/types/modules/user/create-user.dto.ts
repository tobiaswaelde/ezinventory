import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsNotEmptyObject, IsString, ValidateNested } from 'class-validator';
import { CreateUserPreferencesDTO } from '~/types/modules/user-preferences/create-user-preferences.dto';
import { CreateUserProfileDTO } from '~/types/modules/user-profile/create-user-profile.dto';

export class CreateUserDTO {
  @ApiProperty({ example: 'user@domain.com' })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'some-password' })
  @IsString()
  @IsNotEmpty()
  password: string;

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
