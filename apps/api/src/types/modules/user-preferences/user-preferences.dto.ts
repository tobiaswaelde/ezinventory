import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { TIMEZONES } from '~/config/meta/timezones';
import { ApiPropertyCreatedAt } from '~/decorators/properties/api-property-created-at.decorator';
import { ApiPropertyId } from '~/decorators/properties/api-property-id.decorator';
import { ApiPropertyUpdatedAt } from '~/decorators/properties/api-property-updated-at.decorator';
import { AppAbility } from '~/types/casl';
import { CaslSubject } from '~/types/casl/subject';
import { UserPreferencesPayload } from '~/types/modules/user-preferences';
import { CaslUtil } from '~/util/casl';

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

    return CaslUtil.filterKeys(dto, CaslSubject.UserPreferences, ability);
  }
}
