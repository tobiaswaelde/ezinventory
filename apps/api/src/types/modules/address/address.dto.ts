import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import Holidays from 'date-holidays';
import { ApiPropertyCreatedAt } from '~/decorators/properties/api-property-created-at.decorator';
import { ApiPropertyId } from '~/decorators/properties/api-property-id.decorator';
import { ApiPropertyUpdatedAt } from '~/decorators/properties/api-property-updated-at.decorator';
import { AppAbility } from '~/types/casl';
import { CaslSubject } from '~/types/casl/subject';
import { AddressPayload } from '~/types/modules/address';
import { CaslUtil } from '~/util/casl';

const hd = new Holidays();

export class AddressDTO {
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
  @ApiProperty({ example: 'Musterstraße 123' })
  street: string;

  @Expose()
  @ApiPropertyOptional({ example: '45' })
  apartment?: string;

  @Expose()
  @ApiProperty({ example: 'Musterstadt' })
  city: string;

  @Expose()
  @ApiProperty({ example: '12345' })
  zip: string;

  @Expose()
  @ApiProperty({
    example: 'DE',
    description: 'ISO 3166-2 country code',
    enum: Object.keys(hd.getCountries()),
  })
  countryCode: string;

  @Expose()
  @ApiPropertyOptional({ example: 'SL' })
  stateCode?: string;

  @Expose()
  @ApiPropertyOptional({ example: 'A' })
  regionCode?: string;

  constructor(partial: Partial<AddressDTO>) {
    Object.assign(this, partial);
  }

  public static async fromModel(
    model: AddressPayload | null,
    ability: AppAbility,
  ): Promise<AddressDTO> {
    if (!model) return null;

    const dto = new AddressDTO(model);

    return CaslUtil.filterKeys(dto, CaslSubject.Address, ability);
  }
}
