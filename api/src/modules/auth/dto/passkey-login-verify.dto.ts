import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsObject } from 'class-validator';

export class PasskeyLoginVerifyDto {
  @ApiProperty({ example: 'admin@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ type: 'object', additionalProperties: true })
  @IsObject()
  response!: Record<string, unknown>;
}
