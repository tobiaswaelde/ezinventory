import { ApiProperty } from '@nestjs/swagger';
import prismaClient from '@prisma/client';
import type { IconSet as IconSetType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUppercase, MaxLength } from 'class-validator';

const { IconSet } = prismaClient as typeof import('@prisma/client');

export class CreateLocationDto {
  @ApiProperty({ example: 'Garage' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @ApiProperty({ example: 'GARAGE' })
  @IsString()
  @IsNotEmpty()
  @IsUppercase()
  @MaxLength(48)
  code!: string;

  @ApiProperty({ required: false, example: 'Main storage location at home.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ required: false, enum: IconSet, example: IconSet.TABLER })
  @IsOptional()
  @IsEnum(IconSet)
  iconSet?: IconSetType;

  @ApiProperty({ required: false, example: 'building-warehouse' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  iconName?: string;

}
