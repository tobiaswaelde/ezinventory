import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class BootstrapAdminDto {
  @ApiProperty({ example: 'admin@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Initial Admin' })
  @IsString()
  @MaxLength(120)
  displayName!: string;

  @ApiProperty({ example: 'super-secure-password' })
  @IsString()
  @MinLength(12)
  @MaxLength(255)
  password!: string;
}
