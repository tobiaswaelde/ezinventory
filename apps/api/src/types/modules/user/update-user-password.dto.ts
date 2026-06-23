import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateUserPasswordDTO {
  @ApiProperty({ maxLength: 72, example: 'new-password' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(72)
  password: string;
}
