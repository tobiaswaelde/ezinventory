import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { UpdateAddressDTO } from '~/types/modules/address/update-address.dto';

export class UpdateWarehouseDTO {
  @ApiPropertyOptional({ example: 'Main Warehouse' })
  @IsString()
  @MaxLength(100)
  @IsOptional()
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

  @ApiPropertyOptional({ type: () => UpdateAddressDTO, nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateAddressDTO)
  address?: UpdateAddressDTO | null;
}
