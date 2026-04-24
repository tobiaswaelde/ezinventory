import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class MfaSetupDTO {
  @Expose()
  @ApiProperty({ description: 'The MFA secret' })
  secret: string;

  @Expose()
  @ApiProperty({ description: 'The QR code as data URL' })
  dataUrl: string;

  @Expose()
  @ApiProperty({ description: 'The otpauth URI' })
  otpAuth: string;

  constructor(partial: Partial<MfaSetupDTO>) {
    Object.assign(this, partial);
  }
}
