import { ImageFit } from '@/generated/prisma/enums';
import { Optional } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateFileDTO {
  @ApiPropertyOptional({ description: 'Original filename of the file to be uploaded' })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  originalFilename?: string;

  @ApiPropertyOptional({ description: 'Size of the file to be uploaded in bytes' })
  @IsString()
  @IsOptional()
  fileSize?: string;

  @ApiPropertyOptional({
    description:
      'Whether the file is temporary. Temporary files will be automatically deleted after a certain period of time.',
    example: true,
  })
  @IsBoolean()
  @Optional()
  isTemporary?: boolean;

  @ApiPropertyOptional({
    description:
      'Requested storage duration in seconds. After this duration, the file will be automatically deleted. If not provided, the file will be deleted at the next iteraion of the cleanup job.',
  })
  @IsNumber()
  @Min(0)
  @Max(86400) // 24 hours in seconds
  @IsOptional()
  requestedStorageDuration?: number; // in seconds

  @ApiPropertyOptional({
    description: 'Optional width to resize the image to (only applicable for image files)',
  })
  @IsNumber()
  @IsOptional()
  width?: number;

  @ApiPropertyOptional({
    description: 'Optional height to resize the image to (only applicable for image files)',
  })
  @IsNumber()
  @IsOptional()
  height?: number;

  @ApiPropertyOptional({
    description: 'Optional quality to resize the image to (only applicable for image files)',
  })
  @IsNumber()
  @IsOptional()
  quality?: number;

  @ApiPropertyOptional({
    enum: ImageFit,
    description: 'Optional fit mode to resize the image (only applicable for image files)',
    default: ImageFit.COVER,
  })
  @IsEnum(ImageFit)
  @IsOptional()
  fit?: ImageFit;
}
