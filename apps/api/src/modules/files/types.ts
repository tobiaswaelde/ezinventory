import { Prisma } from '@/generated/prisma/client';
import type { BaseDelegateTypeMap } from '@querry-kit/nest';

export class FileTypeMap implements BaseDelegateTypeMap {
  select: Prisma.FileSelect;
  include: Prisma.FileInclude;
  whereInput: Prisma.FileWhereInput;
  orderByWithRelationInput: Prisma.FileOrderByWithRelationInput;
  whereUniqueInput: Prisma.FileWhereUniqueInput;
  scalarFieldEnum: Prisma.FileScalarFieldEnum;
  createInput: Prisma.FileCreateInput;
  uncheckedCreateInput: Prisma.FileUncheckedCreateInput;
  updateManyMutationInput: Prisma.FileUpdateManyMutationInput;
  uncheckedUpdateManyInput: Prisma.FileUncheckedUpdateManyInput;
  updateInput: Prisma.FileUpdateInput;
  uncheckedUpdateInput: Prisma.FileUncheckedUpdateInput;
  aggregateInputType: Prisma.AggregateFile;
}
