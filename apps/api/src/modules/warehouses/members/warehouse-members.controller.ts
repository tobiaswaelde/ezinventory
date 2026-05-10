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
import { JwtAuthGuard } from '~/guards/jwt-auth.guard';
import { PoliciesGuard } from '~/guards/policies.guard';
import { WarehouseMembersService } from '~/modules/warehouses/members/warehouse-members.service';
import { AuthRequest } from '~/types/auth-request';
import { AddWarehouseMemberDTO } from '~/types/modules/warehouses/add-warehouse-member.dto';
import { UpdateWarehouseMemberDTO } from '~/types/modules/warehouses/update-warehouse-member.dto';
import { UsersOnWarehousesDTO } from '~/types/modules/warehouses/users-on-warehouses.dto';

@ApiTags(ApiTag.Warehouses)
@ApiBearerAuth(ApiAuth.JWT)
@Controller(ApiTag.Warehouses)
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class WarehouseMembersController {
  constructor(
    @Inject(WarehouseMembersService.token)
    private readonly warehouseMembersService: WarehouseMembersService,
  ) {}

  @Get('/:warehouseId/members')
  @ApiParamId({ name: 'warehouseId', description: 'ID of the warehouse to get members for.' })
  @ApiOperation({ summary: 'Get all members of a warehouse' })
  @ApiOkResponse({
    description: 'List of warehouse members',
    type: UsersOnWarehousesDTO,
    isArray: true,
  })
  @ApiErrorResponses({
    unauthorizedCodes: [ErrorCode.Unauthorized],
    forbiddenCodes: [ErrorCode.InsufficientPermissions],
    notFoundCodes: [ErrorCode.WarehouseNotFound],
  })
  async getMembers(
    @Req() req: AuthRequest,
    @Param('warehouseId', ParseUUIDPipe) warehouseId: string,
  ) {
    const items = await this.warehouseMembersService.getMembers(req.user, warehouseId);
    return Promise.all(items.map((x) => UsersOnWarehousesDTO.fromModel(x, req.ability)));
  }

  @Post('/:warehouseId/members')
  @ApiParamId({ name: 'warehouseId', description: 'ID of the warehouse to add a member to.' })
  @ApiOperation({
    summary: 'Add a member to a warehouse',
    description:
      'Users with warehouse role `ADMIN` can add members with any role, while `MANAGER` can only add members with role `MEMBER`. Users with role `MEMBER` cannot add warehouse members.',
  })
  @ApiCreatedResponse({ description: 'The added warehouse member', type: UsersOnWarehousesDTO })
  @ApiErrorResponses({
    unauthorizedCodes: [ErrorCode.Unauthorized],
    forbiddenCodes: [ErrorCode.InsufficientPermissions],
    badRequestCodes: [ErrorCode.WarehouseMemberAlreadyExists],
    notFoundCodes: [ErrorCode.WarehouseNotFound, ErrorCode.UserNotFound],
  })
  async addMember(
    @Req() req: AuthRequest,
    @Param('warehouseId', ParseUUIDPipe) warehouseId: string,
    @Body() data: AddWarehouseMemberDTO,
  ) {
    const item = await this.warehouseMembersService.addMember(req.user, warehouseId, data);
    return UsersOnWarehousesDTO.fromModel(item, req.ability);
  }

  @Patch('/:warehouseId/members/:memberId')
  @ApiParamId({ name: 'warehouseId', description: 'ID of the warehouse to update a member for.' })
  @ApiParamId({ name: 'memberId', description: 'ID of the warehouse member to update.' })
  @ApiOperation({ summary: 'Update a warehouse member' })
  @ApiOkResponse({ description: 'The updated warehouse member', type: UsersOnWarehousesDTO })
  @ApiErrorResponses({
    unauthorizedCodes: [ErrorCode.Unauthorized],
    forbiddenCodes: [ErrorCode.InsufficientPermissions],
    badRequestCodes: [ErrorCode.WarehouseMemberCannotRemoveLastAdmin],
    notFoundCodes: [
      ErrorCode.WarehouseMemberNotFound,
      ErrorCode.UserNotFound,
      ErrorCode.WarehouseNotFound,
    ],
  })
  async updateMember(
    @Req() req: AuthRequest,
    @Param('warehouseId', ParseUUIDPipe) warehouseId: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,
    @Body() data: UpdateWarehouseMemberDTO,
  ) {
    const item = await this.warehouseMembersService.updateMember(
      req.user,
      warehouseId,
      memberId,
      data,
    );
    return UsersOnWarehousesDTO.fromModel(item, req.ability);
  }

  @Delete('/:warehouseId/members/:memberId')
  @ApiParamId({ name: 'warehouseId', description: 'ID of the warehouse to remove a member from.' })
  @ApiParamId({ name: 'memberId', description: 'ID of the warehouse member to remove.' })
  @ApiOperation({
    summary: 'Remove a member from a warehouse',
    description:
      'Users with warehouse role `ADMIN` can remove members with any role, while `MANAGER` can only remove members with role `MEMBER`. Users with role `MEMBER` cannot remove warehouse members.',
  })
  @ApiOkResponse({ description: 'The removed warehouse member', type: UsersOnWarehousesDTO })
  @ApiErrorResponses({
    unauthorizedCodes: [ErrorCode.Unauthorized],
    forbiddenCodes: [ErrorCode.InsufficientPermissions],
    badRequestCodes: [ErrorCode.WarehouseMemberCannotRemoveLastAdmin],
    notFoundCodes: [
      ErrorCode.WarehouseMemberNotFound,
      ErrorCode.UserNotFound,
      ErrorCode.WarehouseNotFound,
    ],
  })
  async removeMember(
    @Req() req: AuthRequest,
    @Param('warehouseId', ParseUUIDPipe) warehouseId: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,
  ) {
    const item = await this.warehouseMembersService.removeMember(req.user, warehouseId, memberId);
    return UsersOnWarehousesDTO.fromModel(item, req.ability);
  }
}
