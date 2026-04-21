import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class PasskeyRegisterOptionsDto {
  @ApiProperty({ example: 'admin@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'super-secure-password' })
  @IsString()
  @IsNotEmpty()
  @MinLength(12)
  @MaxLength(255)
  password!: string;
}
