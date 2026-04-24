import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateUserProfileDTO {
  @ApiProperty({ maxLength: 255, example: 'John' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  firstname: string;

  @ApiProperty({ maxLength: 255, example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  lastname: string;
}
