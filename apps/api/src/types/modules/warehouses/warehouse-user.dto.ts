import { WarehouseUserRole } from '@/generated/prisma/enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { UserDTO } from '~/types/modules/user/user.dto';
import { WarehouseUserPayload } from '~/types/modules/warehouses';
import { WarehouseDTO } from '~/types/modules/warehouses/warehouse.dto';

export class WarehouseUserDTO {
  @Expose()
  @ApiProperty({ enum: WarehouseUserRole })
  role: WarehouseUserRole;

  @Expose()
  @ApiPropertyOptional({ type: () => WarehouseDTO })
  warehouse?: WarehouseDTO;

  @Expose()
  @ApiPropertyOptional({ type: () => UserDTO })
  user?: UserDTO;

  constructor(partial: Partial<WarehouseUserDTO>) {
    Object.assign(this, partial);
  }

  public static async fromModel(model?: Partial<WarehouseUserPayload>): Promise<WarehouseUserDTO> {
    if (!model) return null;

    return new WarehouseUserDTO({
      ...model,
      warehouse: await WarehouseDTO.fromModel(model.warehouse),
      user: await UserDTO.fromModel(model.user),
    });
  }
}
