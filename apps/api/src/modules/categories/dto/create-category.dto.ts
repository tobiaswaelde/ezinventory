import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Food' })
  @IsString()
  @MaxLength(120)
  name!: string;

  @ApiProperty({ required: false, example: 'Food and frozen products' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
