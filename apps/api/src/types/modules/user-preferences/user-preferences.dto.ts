import { ApiProperty } from '@nestjs/swagger';
import {
  ApiPropertyCreatedAt,
  ApiPropertyId,
  ApiPropertyUpdatedAt,
  filterCaslFields,
} from '@querry-kit/nest';
import { Expose } from 'class-transformer';
import { TIMEZONES } from '~/config/meta/timezones';
import { AppAbility } from '~/types/casl';
import { CaslAction } from '~/types/casl/action';
import { CaslSubject } from '~/types/casl/subject';
import { UserPreferencesPayload } from '~/types/modules/user-preferences';

export class UserPreferencesDTO {
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
  @ApiProperty()
  language: string;

  @Expose()
  @ApiProperty({
    enum: TIMEZONES,
    description: 'Timezone of the user.',
    example: 'Europe/Berlin',
  })
  timezone?: string;

  constructor(partial: Partial<UserPreferencesDTO>) {
    Object.assign(this, partial);
  }

  public static fromModel(
    model: Partial<UserPreferencesPayload> | undefined,
    ability: AppAbility,
  ): UserPreferencesDTO {
    if (!model) return null;

    const dto = new UserPreferencesDTO({
      ...model,
    });

    return filterCaslFields(dto, CaslSubject.UserPreferences, ability, { action: CaslAction.Read });
  }
}
