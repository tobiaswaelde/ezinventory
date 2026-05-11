import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { S3Bucket } from '~/config/s3';
import { ApiPropertyCreatedAt } from '~/decorators/properties/api-property-created-at.decorator';
import { ApiPropertyId } from '~/decorators/properties/api-property-id.decorator';
import { ApiPropertyUpdatedAt } from '~/decorators/properties/api-property-updated-at.decorator';
import { S3Service } from '~/services/s3.service';
import { AppAbility } from '~/types/casl';
import { CaslSubject } from '~/types/casl/subject';
import { FilePayload } from '~/types/modules/files';
import { CaslUtil } from '~/util/casl';

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

    return CaslUtil.filterKeys(dto, CaslSubject.File, ability);
  }
}
