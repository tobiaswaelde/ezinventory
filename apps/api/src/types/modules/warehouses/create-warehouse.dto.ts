import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateWarehouseDTO {
  @ApiProperty({ example: 'Main Warehouse' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'This is the main warehouse for storing all products.' })
  @IsString()
  @MaxLength(1000)
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'red' })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ example: 'warehouse-icon' })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  icon?: string;
}
