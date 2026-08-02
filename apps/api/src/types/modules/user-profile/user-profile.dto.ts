import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ApiPropertyCreatedAt,
  ApiPropertyId,
  ApiPropertyUpdatedAt,
  filterCaslFields,
} from '@querry-kit/nest';
import { Exclude, Expose } from 'class-transformer';
import { S3Bucket } from '~/config/s3';
import { S3Service } from '~/services/s3.service';
import { AppAbility } from '~/types/casl';
import { CaslAction } from '~/types/casl/action';
import { CaslSubject } from '~/types/casl/subject';
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

  public static async fromModel(
    model: Partial<UserProfilePayload> | undefined,
    ability: AppAbility,
  ): Promise<UserProfileDTO> {
    if (!model) return null;

    const dto = new UserProfileDTO({
      ...model,
      avatarUrl: await S3Service.getFileUrl(S3Bucket.Avatars, model.avatarId),
    });

    return filterCaslFields(dto, CaslSubject.UserProfile, ability, { action: CaslAction.Read });
  }
}
