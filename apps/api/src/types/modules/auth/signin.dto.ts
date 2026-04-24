import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { MfaVerifyDTO } from '~/types/modules/auth/mfa/mfa-verify.dto';

export class SigninDTO extends MfaVerifyDTO {
  @ApiProperty({ maxLength: 255, example: 'user@example.com' })
  @IsString()
  @IsEmail()
  @MaxLength(255)
  @IsNotEmpty()
  email: string;

  @ApiProperty({ maxLength: 72, example: 'password' })
  @IsString()
  @MaxLength(72)
  @IsNotEmpty()
  password: string;
}
