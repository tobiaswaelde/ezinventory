import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import type { StorageHealthResult } from '~/modules/media/media.service.js';

export class StorageHealthResponseDto {
  @Expose()
  @ApiProperty()
  configured!: boolean;

  @Expose()
  @ApiProperty()
  endpoint!: string;

  @Expose()
  @ApiProperty()
  bucket!: string;

  @Expose()
  @ApiProperty()
  reachable!: boolean;

  @Expose()
  @ApiProperty({ nullable: true })
  statusCode!: number | null;

  constructor(partial: Partial<StorageHealthResponseDto>) {
    Object.assign(this, partial);
  }

  static fromModel(model: StorageHealthResult): StorageHealthResponseDto {
    return new StorageHealthResponseDto(model);
  }
}
