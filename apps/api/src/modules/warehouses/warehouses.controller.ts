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
import {
  ApiErrorResponses,
  ApiFieldsQuery,
  ApiPaginatedResponse,
  ApiParamId,
  ApiResourceQuery,
  CheckPolicies,
  FindByIdDTO,
  QueryDTO,
  ResourceQuery,
} from '@querry-kit/nest';
import { ApiAuth, ApiTag } from '~/config/api';
import { JwtAuthGuard } from '~/guards/jwt-auth.guard';
import { PoliciesGuard } from '~/guards/policies.guard';
import { WarehouseTypeMap } from '~/modules/warehouses/types';
import { WarehousesService } from '~/modules/warehouses/warehouses.service';
import { AuthRequest } from '~/types/auth-request';
import { AppAbility } from '~/types/casl';
import { CaslAction } from '~/types/casl/action';
import { CaslSubject } from '~/types/casl/subject';
import { WarehousePayload } from '~/types/modules/warehouses';
import { CreateWarehouseDTO } from '~/types/modules/warehouses/create-warehouse.dto';
import { UpdateWarehouseDTO } from '~/types/modules/warehouses/update-warehouse.dto';
import { WarehouseDTO } from '~/types/modules/warehouses/warehouse.dto';

@ApiTags(ApiTag.Warehouses)
@ApiBearerAuth(ApiAuth.JWT)
@Controller(ApiTag.Warehouses)
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class WarehousesController {
  constructor(
    @Inject(WarehousesService.token) private readonly warehousesService: WarehousesService,
  ) {}

  @Get('/')
  @CheckPolicies<AppAbility>((a) => a.can(CaslAction.Read, CaslSubject.Warehouse))
  @ApiOperation({ summary: 'Query warehouses' })
  @ApiResourceQuery()
  @ApiPaginatedResponse({ description: 'Paginated warehouses', model: WarehouseDTO })
  @ApiErrorResponses({
    unauthorizedCodes: [ErrorCode.Unauthorized],
    forbiddenCodes: [ErrorCode.InsufficientPermissions],
  })
  async queryWarehouses(@Req() req: AuthRequest, @Query() query: QueryDTO<WarehouseTypeMap>) {
    return ResourceQuery.query({
      service: this.warehousesService,
      query,
      ability: req.ability,
      schema: WarehouseDTO,
      include: { members: { include: { user: true } }, address: true, file: true },
      map: (warehouse: WarehousePayload, ability) => WarehouseDTO.fromModel(warehouse, ability),
    });
  }

  @Get('/find-by-id/:id')
  @CheckPolicies<AppAbility>((a) => a.can(CaslAction.Read, CaslSubject.Warehouse))
  @ApiParamId({ description: 'The ID of the warehouse to retrieve.' })
  @ApiOperation({ summary: 'Find warehouse by ID' })
  @ApiFieldsQuery()
  @ApiOkResponse({ description: 'Warehouse', type: WarehouseDTO })
  @ApiErrorResponses({
    unauthorizedCodes: [ErrorCode.Unauthorized],
    forbiddenCodes: [ErrorCode.InsufficientPermissions],
    notFoundCodes: [ErrorCode.WarehouseNotFound],
  })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthRequest,
    @Query() query: FindByIdDTO<WarehouseTypeMap>,
  ) {
    return ResourceQuery.findById({
      service: this.warehousesService,
      id,
      query,
      ability: req.ability,
      schema: WarehouseDTO,
      include: { members: { include: { user: true } }, address: true, file: true },
      map: (warehouse: WarehousePayload, ability) => WarehouseDTO.fromModel(warehouse, ability),
    });
  }

  @Post('/')
  @CheckPolicies<AppAbility>((a) => a.can(CaslAction.Create, CaslSubject.Warehouse))
  @ApiOperation({ summary: 'Create new warehouse' })
  @ApiCreatedResponse({ description: 'Warehouse created successfully', type: WarehouseDTO })
  @ApiErrorResponses({
    unauthorizedCodes: [ErrorCode.Unauthorized],
    forbiddenCodes: [ErrorCode.InsufficientPermissions],
    conflictCodes: [ErrorCode.WarehouseConflictSameName],
  })
  async createWarehouse(@Req() req: AuthRequest, @Body() data: CreateWarehouseDTO) {
    const warehouse = await this.warehousesService.create(req.user.id, data);
    return WarehouseDTO.fromModel(warehouse, req.ability);
  }

  @Patch('/:id')
  @CheckPolicies<AppAbility>((a) => a.can(CaslAction.Update, CaslSubject.Warehouse))
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
    return WarehouseDTO.fromModel(warehouse, req.ability);
  }

  @Delete('/:id')
  @CheckPolicies<AppAbility>((a) => a.can(CaslAction.Delete, CaslSubject.Warehouse))
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
    return WarehouseDTO.fromModel(warehouse, req.ability);
  }
}
