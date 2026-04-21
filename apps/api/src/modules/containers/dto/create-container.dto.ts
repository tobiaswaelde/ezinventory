import { ApiProperty } from '@nestjs/swagger';
import { ContainerType, IconSet } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateContainerDto {
  @ApiProperty({ format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440123' })
  @IsUUID('4')
  locationId!: string;

  @ApiProperty({ required: false, format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440124' })
  @IsOptional()
  @IsUUID('4')
  parentContainerId?: string;

  @ApiProperty({ enum: ContainerType, example: ContainerType.BOX })
  @IsEnum(ContainerType)
  type!: ContainerType;

  @ApiProperty({ example: 'Freezer Drawer 1' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @ApiProperty({ example: 'FREEZER-DRAWER-1' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  code!: string;

  @ApiProperty({ required: false, example: 'Top drawer in kitchen freezer' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ required: false, enum: IconSet, example: IconSet.LUCIDE })
  @IsOptional()
  @IsEnum(IconSet)
  iconSet?: IconSet;

  @ApiProperty({ required: false, example: 'refrigerator' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  iconName?: string;

}
