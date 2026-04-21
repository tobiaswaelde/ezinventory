import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import prismaClient from '@prisma/client';
import { Expose } from 'class-transformer';

import type { StorageHealthResult, UploadedImageResult } from '~/modules/media/media.service.js';

const { AttachmentOwnerType } = prismaClient as typeof import('@prisma/client');

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

export class MediaLibraryItemResponseDto {
  @Expose()
  @ApiPropertyOptional({ format: 'uuid' })
  id?: string;

  @Expose()
  @ApiPropertyOptional({ enum: AttachmentOwnerType })
  ownerType?: keyof typeof AttachmentOwnerType;

  @Expose()
  @ApiPropertyOptional({ format: 'uuid' })
  ownerId?: string;

  @Expose()
  @ApiPropertyOptional()
  fileName?: string;

  @Expose()
  @ApiPropertyOptional()
  mimeType?: string;

  @Expose()
  @ApiPropertyOptional()
  sizeBytes?: number;

  @Expose()
  @ApiPropertyOptional()
  storageKey?: string;

  @Expose()
  @ApiPropertyOptional({ format: 'uuid' })
  uploadedByUserId?: string;

  @Expose()
  @ApiPropertyOptional({ format: 'date-time' })
  createdAt?: Date;

  @Expose()
  @ApiPropertyOptional()
  url?: string;

  constructor(partial: Partial<MediaLibraryItemResponseDto>) {
    Object.assign(this, partial);
  }

  static fromModel(model: Record<string, unknown>): MediaLibraryItemResponseDto {
    return new MediaLibraryItemResponseDto(model);
  }

  static fromModels(models: Array<Record<string, unknown>>): MediaLibraryItemResponseDto[] {
    return models.map((model) => MediaLibraryItemResponseDto.fromModel(model));
  }
}

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

export class DeleteImageResponseDto {
  @Expose()
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @Expose()
  @ApiProperty({ example: true })
  deleted!: true;

  constructor(partial: Partial<DeleteImageResponseDto>) {
    Object.assign(this, partial);
  }

  static fromModel(model: { id: string; deleted: true }): DeleteImageResponseDto {
    return new DeleteImageResponseDto(model);
  }
}
