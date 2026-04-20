import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class CreateItemDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  @IsUUID('4')
  categoryId!: string;

  @ApiProperty({ example: 'SPAGHETTI-SAUCE-001' })
  @IsString()
  @MaxLength(64)
  sku!: string;

  @ApiProperty({ example: 'Spaghetti Sauce' })
  @IsString()
  @MaxLength(120)
  name!: string;

  @ApiProperty({ required: false, example: 'jar' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  unit?: string;

  @ApiProperty({ required: false, example: 'Portion Pack' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  sizeLabel?: string;

  @ApiProperty({ required: false, example: 1.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sizeValue?: number;

  @ApiProperty({ required: false, example: 'L' })
  @IsOptional()
  @IsString()
  @MaxLength(16)
  sizeUnit?: string;

  @ApiProperty({ required: false, example: 3 })
  @IsOptional()
  @IsInt()
  @Min(1)
  servings?: number;
}
