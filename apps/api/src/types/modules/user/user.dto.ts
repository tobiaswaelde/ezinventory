import { UserRole } from '@/generated/prisma/enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ApiPropertyCreatedAt,
  ApiPropertyId,
  ApiPropertyUpdatedAt,
  filterCaslFields,
} from '@querry-kit/nest';
import { Exclude, Expose } from 'class-transformer';
import { AppAbility } from '~/types/casl';
import { CaslAction } from '~/types/casl/action';
import { CaslSubject } from '~/types/casl/subject';
import { UserPayload } from '~/types/modules/user';
import { UserPreferencesDTO } from '~/types/modules/user-preferences/user-preferences.dto';
import { UserProfileDTO } from '~/types/modules/user-profile/user-profile.dto';

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

    return filterCaslFields(dto, CaslSubject.User, ability, { action: CaslAction.Read });
  }
}
