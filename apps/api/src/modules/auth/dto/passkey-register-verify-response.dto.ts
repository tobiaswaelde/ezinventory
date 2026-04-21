import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class PasskeyRegisterVerifyResponseDto {
  @Expose()
  @ApiProperty({ example: true })
  verified!: true;

  @Expose()
  @ApiProperty()
  credentialId!: string;

  @Expose()
  @ApiProperty()
  email!: string;

  constructor(partial: Partial<PasskeyRegisterVerifyResponseDto>) {
    Object.assign(this, partial);
  }

  static fromModel(model: {
    verified: true;
    credentialId: string;
    email: string;
  }): PasskeyRegisterVerifyResponseDto {
    return new PasskeyRegisterVerifyResponseDto(model);
  }
}
