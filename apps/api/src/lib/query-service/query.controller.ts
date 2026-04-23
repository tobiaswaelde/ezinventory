import { Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ApiParamId } from '~/decorators/params/api-param-id.decorator';
import { QueryService } from '~/lib/query-service/query.service';
import { PaginatedDTO } from '~/types/pagination/paginated.dto';
import {
  BaseDelegate,
  BaseDelegateTypeMap,
  CountDTO,
  FindByIdDTO,
  FindManyDTO,
  FindOneDTO,
  FindUniqueDTO,
  QueryDTO,
} from './types';

export abstract class QueryController<
  DelegateType extends BaseDelegate,
  TypeMap extends BaseDelegateTypeMap,
  Dto = any,
> {
  constructor(private queryService: QueryService<DelegateType, TypeMap>) {}

  abstract modelToDto(model);

  @Get('/')
  @ApiOperation({ summary: 'Query items' })
  @ApiOkResponse({ description: 'Paginated items', type: PaginatedDTO<Dto> })
  async query(@Query() query: QueryDTO<TypeMap>) {
    const { items, pageMeta } = await this.queryService.query({ ...query });
    return new PaginatedDTO((items as any).map(this.modelToDto), pageMeta);
  }

  @Get('/find-one')
  @ApiOperation({ summary: 'Find first item matching the filter' })
  @ApiOkResponse({ description: 'Item' })
  async findOne(@Query() query: FindOneDTO<TypeMap>) {
    const item = await this.queryService.findOne(query);
    return this.modelToDto(item);
  }

  @Get('/find-many')
  @ApiOperation({ summary: 'Find all items matching the filter' })
  @ApiOkResponse({ description: 'Items' })
  async findMany(@Query() query: FindManyDTO<TypeMap>) {
    const items = await this.queryService.findMany(query);
    return (items as any).map(this.modelToDto);
  }

  @Get('/find-by-id/:id')
  @ApiOperation({ summary: 'Find item by ID' })
  @ApiOkResponse({ description: 'Item' })
  @ApiNotFoundResponse({ description: 'Item not found.' })
  @ApiParamId({ description: 'The ID of the item to retrieve.' })
  async findById(@Param('id', ParseUUIDPipe) id: string, @Query() query: FindByIdDTO<TypeMap>) {
    const item = await this.queryService.findById(id, query);
    return this.modelToDto(item);
  }

  @Get('/find-unique')
  @ApiOkResponse({ description: 'Items' })
  async findUnique(@Query() query: FindUniqueDTO<TypeMap>) {
    const item = await this.queryService.findUnique(query);
    return this.modelToDto(item);
  }

  // @Get('/aggregate')
  // async aggregate(@Query() query: AggregateDto<TypeMap>) {
  //   const res = await this.queryService.aggregate(query);
  //   return res;
  // }

  @Get('/count')
  async count(@Query() query: CountDTO<TypeMap>) {
    const res = await this.queryService.count(query);
    return res;
  }
}
