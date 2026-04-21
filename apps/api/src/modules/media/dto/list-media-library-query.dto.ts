import prismaClient from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

const { AttachmentOwnerType } = prismaClient as typeof import('@prisma/client');

export const MEDIA_LIBRARY_SORTABLE_FIELDS = ['createdAt', 'fileName', 'sizeBytes'] as const;
export type MediaLibrarySortableField = (typeof MEDIA_LIBRARY_SORTABLE_FIELDS)[number];

export class ListMediaLibraryQueryDto {
  @ApiPropertyOptional({
    description:
      'Comma-separated projection fields. Allowed: id,ownerType,ownerId,fileName,mimeType,sizeBytes,storageKey,uploadedByUserId,createdAt,url',
    example: 'id,fileName,ownerType,ownerId,sizeBytes,createdAt,url'
  })
  @IsOptional()
  @IsString()
  fields?: string;

  @ApiPropertyOptional({
    enum: Object.values(AttachmentOwnerType),
    description: 'Optional owner type filter.'
  })
  @IsOptional()
  @IsEnum(AttachmentOwnerType)
  ownerType?: (typeof AttachmentOwnerType)[keyof typeof AttachmentOwnerType];

  @ApiPropertyOptional({
    description: 'Optional owner identifier filter.',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @IsOptional()
  @IsString()
  ownerId?: string;

  @ApiPropertyOptional({
    description: 'Case-insensitive file name search.',
    example: 'freezer'
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: MEDIA_LIBRARY_SORTABLE_FIELDS,
    description: 'Sort field for media library listing.',
    example: 'createdAt'
  })
  @IsOptional()
  @IsEnum(MEDIA_LIBRARY_SORTABLE_FIELDS)
  sortBy?: MediaLibrarySortableField;

  @ApiPropertyOptional({
    enum: ['asc', 'desc'],
    description: 'Sort direction.',
    example: 'desc'
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortDir?: 'asc' | 'desc';

  @ApiPropertyOptional({
    description: 'Maximum number of rows returned.',
    example: 50,
    minimum: 1,
    maximum: 200
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number;
}
