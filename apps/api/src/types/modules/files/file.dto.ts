import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ApiPropertyCreatedAt,
  ApiPropertyId,
  ApiPropertyUpdatedAt,
  filterCaslFields,
} from '@querry-kit/nest';
import { Expose } from 'class-transformer';
import { S3Bucket } from '~/config/s3';
import { S3Service } from '~/services/s3.service';
import { AppAbility } from '~/types/casl';
import { CaslAction } from '~/types/casl/action';
import { CaslSubject } from '~/types/casl/subject';
import { FilePayload } from '~/types/modules/files';

export class FileDTO {
  @Expose()
  @ApiPropertyId()
  id: string;

  @Expose()
  @ApiPropertyCreatedAt()
  createdAt: Date;

  @Expose()
  @ApiPropertyUpdatedAt()
  updatedAt: Date;

  @Expose()
  @ApiProperty({ example: 'document.pdf', description: 'Original filename of the uploaded file.' })
  originalFilename: string;

  @Expose()
  @ApiProperty({ example: 'application/pdf', description: 'MIME type of the uploaded file.' })
  contentType: string;

  @Expose()
  @ApiProperty({ example: 204800, description: 'Size of the file in bytes.' })
  fileSize: number;

  @Expose()
  @ApiPropertyOptional({ description: 'The width in pixels (for image files)' })
  width?: number;

  @Expose()
  @ApiPropertyOptional({ description: 'The height in pixels (for image files)' })
  height?: number;

  @Expose()
  @ApiPropertyOptional({
    description: 'The quality of the image (for image files, between 1 and 100)',
    example: 90,
    minimum: 1,
    maximum: 100,
  })
  quality?: number;

  @Expose()
  @ApiProperty({ description: 'URL to access the uploaded file.' })
  url: string;

  constructor(partial: Partial<FileDTO>) {
    Object.assign(this, partial);
  }

  public static async fromModel(
    model: FilePayload | undefined,
    ability: AppAbility,
  ): Promise<FileDTO> {
    if (!model) return null;

    const dto = new FileDTO({
      ...model,
      fileSize: model.fileSize ? Number(model.fileSize) : null,
      url: model.isUploaded
        ? await S3Service.getFileUrl(model.bucket as S3Bucket, model.key)
        : null,
    });

    return filterCaslFields(dto, CaslSubject.File, ability, { action: CaslAction.Read });
  }
}
