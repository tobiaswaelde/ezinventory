import { Prisma } from '@/generated/prisma/client';
import { BaseDelegateTypeMap } from '~/lib/query-service/types';

export class UserTypeMap implements BaseDelegateTypeMap {
  select: Prisma.UserSelect;
  include: Prisma.UserInclude;
  whereInput: Prisma.UserWhereInput;
  orderByWithRelationInput: Prisma.UserOrderByWithRelationInput;
  whereUniqueInput: Prisma.UserWhereUniqueInput;
  scalarFieldEnum: Prisma.UserScalarFieldEnum;
  createInput: Prisma.UserCreateInput;
  uncheckedCreateInput: Prisma.UserUncheckedCreateInput;
  updateManyMutationInput: Prisma.UserUpdateManyMutationInput;
  uncheckedUpdateManyInput: Prisma.UserUncheckedUpdateManyInput;
  updateInput: Prisma.UserUpdateInput;
  uncheckedUpdateInput: Prisma.UserUncheckedUpdateInput;
  aggregateInputType: Prisma.AggregateUser;
}
