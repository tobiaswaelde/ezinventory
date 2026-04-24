import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class MfaVerifyDTO {
  @ApiPropertyOptional({ minLength: 6, maxLength: 6, example: '123456' })
  @IsString()
  @MinLength(6)
  @MaxLength(6)
  @IsOptional()
  totp?: string;
}
