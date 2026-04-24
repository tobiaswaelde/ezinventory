// import { RoleAction, RoleSubject } from '@/generated/prisma/client';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@/generated/prisma/internal/prismaNamespace';
// import { accessibleBy } from '@casl/prisma';
import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
// import { AppAbility } from '~/casl/ability.factory';
import {
  BaseDelegate,
  BaseDelegateTypeMap,
  Delegate,
  QueryOptionsMap,
} from '~/lib/query-service/types';
import { serializeDecimalValues } from '~/lib/query-service/util';
import { ErrorCode } from '~/types/error-code';
import { PageMetaDTO } from '~/types/pagination/page-meta.dto';
import { ObjectUtil } from '~/util/object';

@Injectable()
export class QueryService<
  DelegateType extends BaseDelegate = BaseDelegate,
  TypeMap extends BaseDelegateTypeMap = BaseDelegateTypeMap,
  Table extends Delegate<DelegateType> = Delegate<DelegateType>,
  Options extends QueryOptionsMap<TypeMap> = QueryOptionsMap<TypeMap>,
> {
  constructor(
    protected table: Table,
    // protected readonly subject: RoleSubject,
  ) {}

  async findOne<T = DelegateType>(options: Options['findOne']): Promise<T | null> {
    const args: Parameters<DelegateType['findFirst']>[0] = {
      select: ObjectUtil.parse(options.select),
      include: ObjectUtil.parse(options.include),
      where: ObjectUtil.parse(options.where),
      orderBy: ObjectUtil.parse(options.orderBy),
      cursor: ObjectUtil.parse(options.cursor),
      distinct: ObjectUtil.parse(options.distinct),
    };

    const item = await this.table.findFirst(args);
    return item as T | null;
  }

  async findMany<T = DelegateType>(options: Options['findMany'] = {}): Promise<T[]> {
    const args: Parameters<DelegateType['findMany']>[0] = {
      select: ObjectUtil.parse(options.select),
      include: ObjectUtil.parse(options.include),
      where: ObjectUtil.parse(options.where),
      orderBy: ObjectUtil.parse(options.orderBy),
      cursor: ObjectUtil.parse(options.cursor),
      take: options.take,
      skip: options.skip,
      distinct: ObjectUtil.parse(options.distinct),
    };

    const item = await this.table.findMany(args);
    return item as T[];
  }

  /**
   * Find item by ID with optional ability check
   * @param {string} id The ID of the item to find
   * @param {Options['findById']} options The query options
   * @param {AppAbility} ability Optional ability for access control
   * @returns {T | undefined} The found item or `undefined` if not found
   * @throws {NotFoundException} ErrorCode.ItemNotFound
   */
  async findById<T = DelegateType>(
    id: string,
    options: Options['findById'] = {},
    // ability?: AppAbility,
  ): Promise<T | undefined> {
    let mergedWhere: any = { id: id };
    // if (ability) {
    //   const where = accessibleBy(ability, RoleAction.READ)[this.subject];
    //   mergedWhere = {
    //     AND: [where, mergedWhere],
    //   };
    // }

    const args: Parameters<DelegateType['findFirst']>[0] = {
      where: mergedWhere,
      select: ObjectUtil.parse(options.select),
      include: ObjectUtil.parse(options.include),
    };

    try {
      const item = await this.table.findFirst(args);
      if (!item) {
        throw new NotFoundException(ErrorCode.ItemNotFound, `Item with ID '${id}' does not exist.`);
      }

      return item as T;
    } catch (err) {
      this.handleError(err, options, args);
    }
  }

  /**
   * Find unique item
   * @param {Options['findUnique']} options The query options
   * @returns {T} The found item
   * @throws {NotFoundException} ErrorCode.ItemNotFound
   */
  async findUnique<T = DelegateType>(options: Options['findUnique']): Promise<T> {
    const args: Parameters<DelegateType['findUnique']>[0] = {
      where: ObjectUtil.parse(options.where),
      select: ObjectUtil.parse(options.select),
      include: ObjectUtil.parse(options.include),
    };

    const item = await this.table.findUnique(args);
    if (!item) {
      throw new NotFoundException(ErrorCode.ItemNotFound, `No matching item found.`);
    }

    return item as T;
  }

  async aggregate(options: Options['aggregate']) {
    const args: Parameters<DelegateType['aggregate']>[0] = {
      ...options,
      where: ObjectUtil.parse(options.where),
      orderBy: ObjectUtil.parse(options.orderBy),
      cursor: ObjectUtil.parse(options.cursor),
    };

    const cleanedArgs = Object.fromEntries(
      Object.entries(args).filter(([_, v]) => v !== undefined),
    );

    const res = await this.table.aggregate(cleanedArgs);
    return serializeDecimalValues(res);
  }

  async count(options: Options['count']) {
    const args: Parameters<DelegateType['count']>[0] = { where: ObjectUtil.parse(options.where) };

    const res = await this.table.count(args);
    return res;
  }

  async query<T = DelegateType>(
    options: Options['query'],
    // ability?: AppAbility,
  ): Promise<{ pageMeta: PageMetaDTO; items: T[] }> {
    const { page, perPage, ...findOptions } = options;
    const skip = (page - 1) * perPage;

    // get number of items
    const itemCount = (await this.count({ where: ObjectUtil.parse(options.where) })) as number;

    // get items
    const items = await this.findMany<T>({ take: perPage, skip: skip, ...findOptions });

    const pageMeta = new PageMetaDTO({ itemCount, pageOptions: { page, perPage } });
    return { pageMeta, items };
  }

  /**
   * Handle errors from Prisma client
   * @param {any} err The error object
   * @param {any} options The query options
   * @param {any} args The parsed query arguments
   * @throws {BadRequestException | InternalServerErrorException | HttpException} Appropriate exception based on the error
   */
  private handleError(err: any, options?: any, args?: any) {
    // handle user input related errors
    if (err instanceof PrismaClientValidationError) {
      throw new BadRequestException({
        message: 'Invalid query.',
        options: options,
        parsedArgs: args,
      });
    }
    // handle query related errors
    else if (err instanceof PrismaClientKnownRequestError) {
      throw new BadRequestException({
        message: err.message.split('\n\n\n')[1] ?? 'Invalid data',
        code: err.code,
        data: err.meta,
      });
    }

    // pass HTTP exceptions
    if (err instanceof HttpException) {
      throw err;
    }

    // handle eny other errors
    console.error(err);
    throw new InternalServerErrorException();
  }
}
