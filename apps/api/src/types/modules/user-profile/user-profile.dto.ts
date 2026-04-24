import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { S3Bucket } from '~/config/s3';
import { ApiPropertyCreatedAt } from '~/decorators/properties/api-property-created-at.decorator';
import { ApiPropertyId } from '~/decorators/properties/api-property-id.decorator';
import { ApiPropertyUpdatedAt } from '~/decorators/properties/api-property-updated-at.decorator';
import { S3Service } from '~/services/s3.service';
import { UserProfilePayload } from '~/types/modules/user-profile';

export class UserProfileDTO {
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
  @ApiProperty({ example: 'John' })
  firstname: string;

  @Expose()
  @ApiProperty({ example: 'Doe' })
  lastname: string;

  @Exclude()
  avatarId?: string;

  @Expose()
  @ApiPropertyOptional()
  avatarUrl?: string;

  constructor(partial: Partial<UserProfileDTO>) {
    Object.assign(this, partial);
  }

  public static async fromModel(model?: Partial<UserProfilePayload>): Promise<UserProfileDTO> {
    if (!model) return null;

    const dto = new UserProfileDTO({
      ...model,

      avatarUrl: await S3Service.getFileUrl(S3Bucket.Avatars, model.avatarId),
    });

    return dto;
  }
}
