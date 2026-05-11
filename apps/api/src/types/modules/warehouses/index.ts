import { WarehouseGetPayload, WarehouseUserGetPayload } from '@/generated/prisma/models';
import { Optional } from '@prisma/client/runtime/client';

export type WarehousePayload = Optional<
  WarehouseGetPayload<{
    include: {
      address: true;
      members: true;
      file: true;
    };
  }>,
  'address' | 'members' | 'file'
>;

export type UserOnWarehousePayload = Optional<
  WarehouseUserGetPayload<{
    include: {
      warehouse: true;
      user: true;
    };
  }>,
  'warehouse' | 'user'
>;
