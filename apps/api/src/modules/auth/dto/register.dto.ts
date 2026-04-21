import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'new.user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'SuperSecurePassword123!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(12)
  @MaxLength(255)
  password!: string;

  @ApiProperty({ example: 'Alex Doe' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(120)
  displayName!: string;

  @ApiProperty({ required: false, enum: ['de', 'en'], example: 'de' })
  @IsOptional()
  @IsString()
  @IsIn(['de', 'en'])
  preferredLanguage?: 'de' | 'en';
}
