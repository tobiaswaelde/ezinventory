import { WarehouseGetPayload, WarehouseUserGetPayload } from '@/generated/prisma/models';
import { Optional } from '@prisma/client/runtime/client';

export type WarehousePayload = Optional<
  WarehouseGetPayload<{
    include: {
      members: true;
    };
  }>,
  'members'
>;

export type WarehouseUserPayload = Optional<
  WarehouseUserGetPayload<{
    include: {
      warehouse: true;
      user: true;
    };
  }>,
  'warehouse' | 'user'
>;
