import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class MfaEnableDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  secret: string;

  @ApiProperty({ minLength: 6, maxLength: 6, example: '123456' })
  @IsString()
  @MinLength(6)
  @MaxLength(6)
  @IsNotEmpty()
  totp: string;
}
