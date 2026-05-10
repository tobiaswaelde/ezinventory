import { ErrorCode } from '@ezinventory/shared/types/error-code';
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiAuth, ApiTag } from '~/config/api';
import { ApiParamId } from '~/decorators/params/api-param-id.decorator';
import { ApiErrorResponses } from '~/decorators/responses/api-error-responses.decorator';
import { ApiPaginatedResponse } from '~/decorators/responses/api-paginated-response.decorator';
import { JwtAuthGuard } from '~/guards/jwt-auth.guard';
import { FindByIdDTO, QueryDTO } from '~/lib/query-service/types';
import { WarehouseTypeMap } from '~/modules/warehouses/types';
import { WarehousesService } from '~/modules/warehouses/warehouses.service';
import { AuthRequest } from '~/types/auth-request';
import { WarehousePayload } from '~/types/modules/warehouses';
import { CreateWarehouseDTO } from '~/types/modules/warehouses/create-warehouse.dto';
import { UpdateWarehouseDTO } from '~/types/modules/warehouses/update-warehouse.dto';
import { WarehouseDTO } from '~/types/modules/warehouses/warehouse.dto';
import { PaginatedDTO } from '~/types/pagination/paginated.dto';

@ApiTags(ApiTag.Warehouses)
@ApiBearerAuth(ApiAuth.JWT)
@Controller(ApiTag.Warehouses)
@UseGuards(JwtAuthGuard)
export class WarehousesController {
  constructor(
    @Inject(WarehousesService.token) private readonly warehousesService: WarehousesService,
  ) {}

  @Get('/')
  @ApiOperation({ summary: 'Query warehouses' })
  @ApiPaginatedResponse({ description: 'Paginated warehouses', model: WarehouseDTO })
  @ApiErrorResponses({
    unauthorizedCodes: [ErrorCode.Unauthorized],
    forbiddenCodes: [ErrorCode.InsufficientPermissions],
  })
  async queryWarehouses(@Query() query: QueryDTO<WarehouseTypeMap>) {
    const { items, pageMeta } = await this.warehousesService.query<WarehousePayload>({ ...query });
    return new PaginatedDTO(
      await Promise.all(items.map((x) => WarehouseDTO.fromModel(x))),
      pageMeta,
    );
  }

  @Get('/find-by-id/:id')
  @ApiParamId({ description: 'The ID of the warehouse to retrieve.' })
  @ApiOperation({ summary: 'Find warehouse by ID' })
  @ApiOkResponse({ description: 'Warehouse', type: WarehouseDTO })
  @ApiErrorResponses({
    unauthorizedCodes: [ErrorCode.Unauthorized],
    forbiddenCodes: [ErrorCode.InsufficientPermissions],
    notFoundCodes: [ErrorCode.WarehouseNotFound],
  })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: FindByIdDTO<WarehouseTypeMap>,
  ) {
    const item = await this.warehousesService.findById<WarehousePayload>(id, query);
    return WarehouseDTO.fromModel(item);
  }

  @Post('/')
  @ApiOperation({ summary: 'Create new warehouse' })
  @ApiCreatedResponse({ description: 'Warehouse created successfully', type: WarehouseDTO })
  @ApiErrorResponses({
    unauthorizedCodes: [ErrorCode.Unauthorized],
    forbiddenCodes: [ErrorCode.InsufficientPermissions],
    conflictCodes: [ErrorCode.WarehouseConflictSameName],
  })
  async createWarehouse(@Req() req: AuthRequest, @Body() data: CreateWarehouseDTO) {
    const warehouse = await this.warehousesService.create(req.user.id, data);
    return WarehouseDTO.fromModel(warehouse);
  }

  @Patch('/:id')
  @ApiOperation({ summary: 'Update warehouse by ID' })
  @ApiOkResponse({ description: 'Updated warehouse', type: WarehouseDTO })
  @ApiErrorResponses({
    unauthorizedCodes: [ErrorCode.Unauthorized],
    forbiddenCodes: [ErrorCode.InsufficientPermissions],
    notFoundCodes: [ErrorCode.WarehouseNotFound],
    conflictCodes: [ErrorCode.WarehouseConflictSameName],
  })
  async updateWarehouse(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthRequest,
    @Body() data: UpdateWarehouseDTO,
  ) {
    const warehouse = await this.warehousesService.update(req.user.id, id, data);
    return WarehouseDTO.fromModel(warehouse);
  }

  @Delete('/:id')
  @ApiParamId({ description: 'The ID of the warehouse to delete.' })
  @ApiOperation({ summary: 'Delete warehouse by ID' })
  @ApiOkResponse({ description: 'Deleted warehouse', type: WarehouseDTO })
  @ApiErrorResponses({
    unauthorizedCodes: [ErrorCode.Unauthorized],
    forbiddenCodes: [ErrorCode.InsufficientPermissions],
    notFoundCodes: [ErrorCode.WarehouseNotFound],
  })
  async deleteWarehouse(@Param('id', ParseUUIDPipe) id: string, @Req() req: AuthRequest) {
    const warehouse = await this.warehousesService.delete(req.user.id, id);
    return WarehouseDTO.fromModel(warehouse);
  }
}
