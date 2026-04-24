import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { MfaVerifyDTO } from '~/types/modules/auth/mfa/mfa-verify.dto';

export class UpdatePasswordDTO extends MfaVerifyDTO {
  @ApiProperty({ maxLength: 72, example: 'current-password' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(72)
  currentPassword: string;

  @ApiProperty({ maxLength: 72, example: 'new-password' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(72)
  newPassword: string;
}
