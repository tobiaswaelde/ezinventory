import { WarehouseUserRole } from '@/generated/prisma/enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { ApiPropertyId } from '~/decorators/properties/api-property-id.decorator';
import { AppAbility } from '~/types/casl';
import { UserDTO } from '~/types/modules/user/user.dto';
import { UserOnWarehousePayload } from '~/types/modules/warehouses';
import { WarehouseDTO } from '~/types/modules/warehouses/warehouse.dto';

export class UsersOnWarehousesDTO {
  @Expose()
  @ApiPropertyId()
  warehouseId: string;

  @Expose()
  @ApiPropertyId()
  userId: string;

  @Expose()
  @ApiProperty({ enum: WarehouseUserRole })
  role: WarehouseUserRole;

  @Expose()
  @ApiPropertyOptional({ type: () => WarehouseDTO })
  warehouse?: WarehouseDTO;

  @Expose()
  @ApiPropertyOptional({ type: () => UserDTO })
  user?: UserDTO;

  constructor(partial: Partial<UsersOnWarehousesDTO>) {
    Object.assign(this, partial);
  }

  public static async fromModel(
    model: Partial<UserOnWarehousePayload> | undefined,
    ability: AppAbility,
  ): Promise<UsersOnWarehousesDTO> {
    if (!model) return null;

    return new UsersOnWarehousesDTO({
      ...model,
      warehouse: await WarehouseDTO.fromModel(model.warehouse, ability),
      user: await UserDTO.fromModel(model.user, ability),
    });
  }
}
