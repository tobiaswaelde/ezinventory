import { ApiProperty } from '@nestjs/swagger';
import prismaClient from '@prisma/client';
import { Expose } from 'class-transformer';

import type { UploadedImageResult } from '~/modules/media/media.service.js';

const { AttachmentOwnerType } = prismaClient as typeof import('@prisma/client');

export class UploadedImageResponseDto {
  @Expose()
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @Expose()
  @ApiProperty({ enum: AttachmentOwnerType })
  ownerType!: keyof typeof AttachmentOwnerType;

  @Expose()
  @ApiProperty({ format: 'uuid' })
  ownerId!: string;

  @Expose()
  @ApiProperty()
  fileName!: string;

  @Expose()
  @ApiProperty()
  mimeType!: string;

  @Expose()
  @ApiProperty()
  sizeBytes!: number;

  @Expose()
  @ApiProperty()
  storageKey!: string;

  @Expose()
  @ApiProperty()
  url!: string;

  @Expose()
  @ApiProperty({ format: 'date-time' })
  createdAt!: Date;

  constructor(partial: Partial<UploadedImageResponseDto>) {
    Object.assign(this, partial);
  }

  static fromModel(model: UploadedImageResult): UploadedImageResponseDto {
    return new UploadedImageResponseDto(model);
  }
}
