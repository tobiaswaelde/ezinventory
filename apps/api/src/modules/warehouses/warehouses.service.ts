import { WarehouseDelegate } from '@/generated/prisma/models';
import { ErrorCode } from '@ezinventory/shared/types/error-code';
import { ConflictException, Injectable } from '@nestjs/common';
import { QueryService } from '~/lib/query-service/query.service';
import { WarehouseTypeMap } from '~/modules/warehouses/types';
import { PrismaService } from '~/prisma/prisma.service';
import { WarehousePayload } from '~/types/modules/warehouses';
import { CreateWarehouseDTO } from '~/types/modules/warehouses/create-warehouse.dto';

@Injectable()
export class WarehousesService extends QueryService<WarehouseDelegate, WarehouseTypeMap> {
  public static readonly token = 'WAREHOUSES_SERVICE';

  constructor(protected readonly db: PrismaService) {
    super(db.warehouse);
  }

  public async create(data: CreateWarehouseDTO): Promise<WarehousePayload> {
    return this.db.$transaction(async (tx) => {
      // check if a warehouse with the same name already exists
      const existingWarehouse = await tx.warehouse.findUnique({
        where: { name: data.name },
      });

      if (existingWarehouse) {
        throw new ConflictException(
          ErrorCode.WarehouseConflictSameName,
          `A warehouse with the name "${data.name}" already exists.`,
        );
      }

      // create the new warehouse
      const warehouse = await tx.warehouse.create({
        data: {
          name: data.name,
          description: data.description,
          color: data.color,
          icon: data.icon,
        },
      });

      return warehouse;
    });
  }

  // public async update(id: string, data: UpdateWarehouseDTO): Promise<WarehousePayload> {
  //   return this.db.$transaction(async (tx) => {
  //     //
  //   });
  // }
}
