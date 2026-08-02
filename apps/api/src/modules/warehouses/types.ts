import { Prisma } from '@/generated/prisma/client';
import type { BaseDelegateTypeMap } from '@querry-kit/nest';

export class WarehouseTypeMap implements BaseDelegateTypeMap {
  select: Prisma.WarehouseSelect;
  include: Prisma.WarehouseInclude;
  whereInput: Prisma.WarehouseWhereInput;
  orderByWithRelationInput: Prisma.WarehouseOrderByWithRelationInput;
  whereUniqueInput: Prisma.WarehouseWhereUniqueInput;
  scalarFieldEnum: Prisma.WarehouseScalarFieldEnum;
  createInput: Prisma.WarehouseCreateInput;
  uncheckedCreateInput: Prisma.WarehouseUncheckedCreateInput;
  updateManyMutationInput: Prisma.WarehouseUpdateManyMutationInput;
  uncheckedUpdateManyInput: Prisma.WarehouseUncheckedUpdateManyInput;
  updateInput: Prisma.WarehouseUpdateInput;
  uncheckedUpdateInput: Prisma.WarehouseUncheckedUpdateInput;
  aggregateInputType: Prisma.AggregateWarehouse;
}
