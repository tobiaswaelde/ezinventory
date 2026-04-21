import { ApiPropertyOptional } from '@nestjs/swagger';
import prismaClient from '@prisma/client';
import { Expose } from 'class-transformer';

const { AttachmentOwnerType } = prismaClient as typeof import('@prisma/client');

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
