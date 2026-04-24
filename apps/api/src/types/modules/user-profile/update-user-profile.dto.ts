import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUserProfileDTO {
  @ApiPropertyOptional({ maxLength: 255, example: 'John' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  firstname?: string;

  @ApiPropertyOptional({ maxLength: 255, example: 'Doe' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  lastname?: string;
}
