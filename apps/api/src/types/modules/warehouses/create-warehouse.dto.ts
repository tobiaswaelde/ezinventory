import { WarehouseType } from '@/generated/prisma/enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { CreateAddressDTO } from '~/types/modules/address/create-address.dto';

export class CreateWarehouseDTO {
  @ApiProperty({ enum: WarehouseType, example: WarehouseType.WAREHOUSE })
  @IsEnum(WarehouseType)
  @IsNotEmpty()
  type: WarehouseType;

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

  @ApiPropertyOptional({ type: () => CreateAddressDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateAddressDTO)
  address?: CreateAddressDTO;
}
