import { UserRole } from '@/generated/prisma/enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { ApiPropertyCreatedAt } from '~/decorators/properties/api-property-created-at.decorator';
import { ApiPropertyId } from '~/decorators/properties/api-property-id.decorator';
import { ApiPropertyUpdatedAt } from '~/decorators/properties/api-property-updated-at.decorator';
import { AppAbility } from '~/types/casl';
import { CaslSubject } from '~/types/casl/subject';
import { UserPayload } from '~/types/modules/user';
import { UserPreferencesDTO } from '~/types/modules/user-preferences/user-preferences.dto';
import { UserProfileDTO } from '~/types/modules/user-profile/user-profile.dto';
import { CaslUtil } from '~/util/casl';

export class UserDTO {
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
  @ApiProperty({ example: 'user@domain.com' })
  email: string;

  @Exclude()
  password: string;

  @Expose()
  @ApiProperty()
  passwordChangedAt: Date;

  @Expose()
  @ApiProperty()
  isMfaEnabled: boolean;

  @Exclude()
  mfaSecret?: string;

  @Expose()
  @ApiPropertyOptional({ enum: UserRole })
  role?: UserRole;

  @Expose()
  @ApiProperty({ description: 'Token used for websocket authentication' })
  websocketToken: string;

  @Expose()
  @ApiPropertyOptional({ type: () => UserProfileDTO })
  profile?: UserProfileDTO;

  @Expose()
  @ApiPropertyOptional({ type: () => UserPreferencesDTO })
  preferences?: UserPreferencesDTO;

  constructor(partial: Partial<UserDTO>) {
    Object.assign(this, partial);
  }

  public static async fromModel(
    model: Partial<UserPayload> | undefined,
    ability: AppAbility,
  ): Promise<UserDTO> {
    if (!model) return null;

    const dto = new UserDTO({
      ...model,
      preferences: await UserPreferencesDTO.fromModel(model.preferences, ability),
      profile: await UserProfileDTO.fromModel(model.profile, ability),
    });

    return CaslUtil.filterKeys(dto, CaslSubject.User, ability);
  }
}
