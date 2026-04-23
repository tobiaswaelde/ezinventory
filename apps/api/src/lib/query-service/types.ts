import { XOR } from '@/generated/prisma/internal/prismaNamespace';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { PageOptionsDTO } from '~/types/pagination/page-options.dto';

//#region delegate
export interface BaseDelegateTypeMap {
  select: unknown;
  include: unknown;
  whereInput: unknown;
  orderByWithRelationInput: unknown;
  whereUniqueInput: unknown;
  scalarFieldEnum: unknown;

  createInput: unknown;
  uncheckedCreateInput: unknown;
  updateManyMutationInput: unknown;
  uncheckedUpdateManyInput: unknown;
  updateInput: unknown;
  uncheckedUpdateInput: unknown;

  aggregateInputType: {
    _count?: unknown;
    _min?: unknown;
    _max?: unknown;
    _avg?: unknown;
    _sum?: unknown;
  };
}
export interface DelegateTypeMap<T extends BaseDelegateTypeMap> {
  select: T['select'];
  include: T['include'];
  where: T['whereInput'];
  orderBy: T['orderByWithRelationInput'] | T['orderByWithRelationInput'][];
  cursor: T['whereUniqueInput'];
  distinct: T['scalarFieldEnum'];

  createData: XOR<T['createInput'], T['uncheckedCreateInput']>;
  updateManyData: XOR<T['updateManyMutationInput'], T['uncheckedUpdateManyInput']>;
  updateData: XOR<T['updateInput'], T['uncheckedUpdateInput']>;

  aggregate: T['aggregateInputType'];
}

export interface BaseDelegate {
  create(args: unknown): unknown;
  findMany(args: unknown): unknown;
  updateMany(args: unknown): unknown;
  update(args: unknown): unknown;
  upsert(args: unknown): unknown;
  deleteMany(args: unknown): unknown;
  delete(args: unknown): unknown;
  findFirst(args: unknown): unknown;
  findUnique(args: unknown): unknown;
  aggregate(args: unknown): unknown;
  count(args: unknown): unknown;
}

export interface Delegate<T extends BaseDelegate> {
  create(args: Parameters<T['create']>[0]): ReturnType<T['create']>;
  findMany(args: Parameters<T['findMany']>[0]): ReturnType<T['findMany']>;
  updateMany(args: Parameters<T['updateMany']>[0]): ReturnType<T['updateMany']>;
  update(args: Parameters<T['update']>[0]): ReturnType<T['update']>;
  upsert(args: Parameters<T['upsert']>[0]): ReturnType<T['upsert']>;
  deleteMany(args: Parameters<T['deleteMany']>[0]): ReturnType<T['deleteMany']>;
  delete(args: Parameters<T['delete']>[0]): ReturnType<T['delete']>;
  findFirst(args: Parameters<T['findFirst']>[0]): ReturnType<T['findFirst']>;
  findUnique(args: Parameters<T['findUnique']>[0]): ReturnType<T['findUnique']>;
  aggregate(args: Parameters<T['aggregate']>[0]): ReturnType<T['aggregate']>;
  count(args: Parameters<T['count']>[0]): ReturnType<T['count']>;
}
//#endregion

//#region DTOs
export class FindOneDTO<
  TM extends BaseDelegateTypeMap,
  T extends DelegateTypeMap<TM> = DelegateTypeMap<TM>,
> {
  @ApiPropertyOptional() @IsOptional() select?: T['select'];
  @ApiPropertyOptional() @IsOptional() include?: T['include'];
  @ApiPropertyOptional() @IsOptional() where?: T['where'];
  @ApiPropertyOptional() @IsOptional() orderBy?: T['orderBy'] | T['orderBy'][];
  @ApiPropertyOptional() @IsOptional() cursor?: T['cursor'];
  @ApiPropertyOptional() @IsOptional() distinct?: T['distinct'] | T['distinct'][];
}

export class FindManyDTO<
  TM extends BaseDelegateTypeMap,
  T extends DelegateTypeMap<TM> = DelegateTypeMap<TM>,
> {
  @ApiPropertyOptional() @IsOptional() select?: T['select'];
  @ApiPropertyOptional() @IsOptional() include?: T['include'];
  @ApiPropertyOptional() @IsOptional() where?: T['where'];
  @ApiPropertyOptional() @IsOptional() orderBy?: T['orderBy'] | T['orderBy'][];
  @ApiPropertyOptional() @IsOptional() cursor?: T['cursor'];
  @ApiPropertyOptional() @IsOptional() take?: number;
  @ApiPropertyOptional() @IsOptional() skip?: number;
  @ApiPropertyOptional() @IsOptional() distinct?: T['distinct'] | T['distinct'][];
}

export class FindByIdDTO<
  TM extends BaseDelegateTypeMap,
  T extends DelegateTypeMap<TM> = DelegateTypeMap<TM>,
> {
  @ApiPropertyOptional() @IsOptional() fields?: string;
  @ApiPropertyOptional() @IsOptional() select?: T['select'];
  @ApiPropertyOptional() @IsOptional() include?: T['include'];
}

export class FindUniqueDTO<
  TM extends BaseDelegateTypeMap,
  T extends DelegateTypeMap<TM> = DelegateTypeMap<TM>,
> {
  @ApiPropertyOptional() @IsOptional() where: T['where'];
  @ApiPropertyOptional() @IsOptional() select?: T['select'];
  @ApiPropertyOptional() @IsOptional() include?: T['include'];
}

export class AggregateDTO<
  TM extends BaseDelegateTypeMap,
  T extends DelegateTypeMap<TM> = DelegateTypeMap<TM>,
> {
  @ApiPropertyOptional() @IsOptional() where?: T['where'];
  @ApiPropertyOptional() @IsOptional() orderBy?: T['orderBy'] | T['orderBy'][];
  @ApiPropertyOptional() @IsOptional() cursor?: T['cursor'];
  @ApiPropertyOptional() @IsOptional() take?: number;
  @ApiPropertyOptional() @IsOptional() skip?: number;
  @ApiPropertyOptional() @IsOptional() _count?: T['aggregate']['_count'];
  @ApiPropertyOptional() @IsOptional() _min?: T['aggregate']['_min'];
  @ApiPropertyOptional() @IsOptional() _max?: T['aggregate']['_max'];
  @ApiPropertyOptional() @IsOptional() _avg?: T['aggregate']['_avg'];
  @ApiPropertyOptional() @IsOptional() _sum?: T['aggregate']['_sum'];
}

export class CountDTO<
  TM extends BaseDelegateTypeMap,
  T extends DelegateTypeMap<TM> = DelegateTypeMap<TM>,
> {
  @ApiPropertyOptional() @IsOptional() where?: T['where'];
}

export class QueryDTO<
  TM extends BaseDelegateTypeMap,
  T extends DelegateTypeMap<TM> = DelegateTypeMap<TM>,
> extends PageOptionsDTO {
  @ApiPropertyOptional() @IsOptional() fields?: string;
  @ApiPropertyOptional() @IsOptional() select?: T['select'];
  @ApiPropertyOptional() @IsOptional() include?: T['include'];
  @ApiPropertyOptional() @IsOptional() where?: T['where'];
  @ApiPropertyOptional() @IsOptional() orderBy?: T['orderBy'] | T['orderBy'][];
  @ApiPropertyOptional() @IsOptional() cursor?: T['cursor'];
  @ApiPropertyOptional() @IsOptional() distinct?: T['distinct'] | T['distinct'][];
}
//#endregion

//#region options
export interface QueryOptionsMap<
  TM extends BaseDelegateTypeMap,
  // T extends DelegateTypeMap<TM> = DelegateTypeMap<TM>,
> {
  findOne: FindOneDTO<TM>;
  findMany: FindManyDTO<TM>;
  findById: FindByIdDTO<TM>;
  findUnique: FindUniqueDTO<TM>;
  aggregate: AggregateDTO<TM>;
  count: CountDTO<TM>;
  query: QueryDTO<TM>;
}
//#endregion
