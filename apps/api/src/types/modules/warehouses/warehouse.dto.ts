import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { ApiPropertyCreatedAt } from '~/decorators/properties/api-property-created-at.decorator';
import { ApiPropertyId } from '~/decorators/properties/api-property-id.decorator';
import { ApiPropertyUpdatedAt } from '~/decorators/properties/api-property-updated-at.decorator';
import { AppAbility } from '~/types/casl';
import { WarehousePayload } from '~/types/modules/warehouses';
import { WarehouseUserDTO } from '~/types/modules/warehouses/warehouse-user.dto';

export class WarehouseDTO {
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
  @ApiProperty({ example: 'Main Warehouse' })
  name: string;

  @Expose()
  @ApiPropertyOptional({ example: 'This is the main warehouse for storing all products.' })
  description?: string;

  @Expose()
  @ApiPropertyOptional({ example: 'red' })
  color?: string;

  @Expose()
  @ApiPropertyOptional({ example: 'warehouse-icon' })
  icon?: string;

  @Expose()
  @ApiPropertyOptional({ type: () => WarehouseUserDTO, isArray: true })
  members?: WarehouseUserDTO[];

  constructor(partial: Partial<WarehouseDTO>) {
    Object.assign(this, partial);
  }

  public static async fromModel(
    model: Partial<WarehousePayload> | undefined,
    ability: AppAbility,
  ): Promise<WarehouseDTO> {
    if (!model) return null;

    return new WarehouseDTO({
      ...model,
      members: await Promise.all(
        (model.members ?? []).map((member) => WarehouseUserDTO.fromModel(member, ability)),
      ),
    });
  }
}
