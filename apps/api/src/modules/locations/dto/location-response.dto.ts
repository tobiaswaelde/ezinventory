import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import type { LocationResponse } from '~/modules/locations/locations.service.js';

export class LocationResponseDto {
  @Expose()
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @Expose()
  @ApiProperty()
  name!: string;

  @Expose()
  @ApiProperty()
  code!: string;

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

  constructor(partial: Partial<LocationResponseDto>) {
    Object.assign(this, partial);
  }

  static fromModel(model: LocationResponse): LocationResponseDto {
    return new LocationResponseDto(model);
  }

  static fromModels(models: LocationResponse[]): LocationResponseDto[] {
    return models.map((model) => LocationResponseDto.fromModel(model));
  }
}
