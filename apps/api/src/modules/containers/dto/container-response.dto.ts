import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import type { ContainerResponse } from '~/modules/containers/containers.service.js';

export class ContainerResponseDto {
  @Expose()
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @Expose()
  @ApiProperty({ format: 'uuid' })
  locationId!: string;

  @Expose()
  @ApiProperty({ format: 'uuid', nullable: true })
  parentContainerId!: string | null;

  @Expose()
  @ApiProperty()
  type!: string;

  @Expose()
  @ApiProperty()
  name!: string;

  @Expose()
  @ApiProperty()
  code!: string;

  @Expose()
  @ApiProperty()
  qrCodeValue!: string;

  @Expose()
  @ApiProperty({ nullable: true })
  description!: string | null;

  @Expose()
  @ApiProperty({ nullable: true })
  iconSet!: string | null;

  @Expose()
  @ApiProperty({ nullable: true })
  iconName!: string | null;

  @Expose()
  @ApiProperty()
  isActive!: boolean;

  constructor(partial: Partial<ContainerResponseDto>) {
    Object.assign(this, partial);
  }

  static fromModel(model: ContainerResponse): ContainerResponseDto {
    return new ContainerResponseDto(model);
  }

  static fromModels(models: ContainerResponse[]): ContainerResponseDto[] {
    return models.map((model) => ContainerResponseDto.fromModel(model));
  }
}
