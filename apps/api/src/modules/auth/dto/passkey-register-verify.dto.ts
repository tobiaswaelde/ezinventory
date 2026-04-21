import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class PasskeyRegisterVerifyDto {
  @ApiProperty({ example: 'admin@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ type: 'object', additionalProperties: true })
  @IsObject()
  response!: Record<string, unknown>;

  @ApiProperty({ required: false, example: 'MacBook Pro Touch ID' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  deviceName?: string;
}
