import { ApiProperty } from '@nestjs/swagger';
import { IconSet } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsUppercase, MaxLength } from 'class-validator';

export class CreateLocationDto {
  @ApiProperty({ example: 'Garage' })
  @IsString()
  @MaxLength(120)
  name!: string;

  @ApiProperty({ example: 'GARAGE' })
  @IsString()
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
  iconSet?: IconSet;

  @ApiProperty({ required: false, example: 'building-warehouse' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  iconName?: string;

}
