import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse
} from '@nestjs/swagger';

import { CheckPolicies } from '~/modules/auth/casl/check-policies.decorator.js';
import { AccessTokenGuard } from '~/modules/auth/guards/access-token.guard.js';
import { PoliciesGuard } from '~/modules/auth/guards/policies.guard.js';
import { BootstrapAdminDto } from '~/modules/setup/dto/bootstrap-admin.dto.js';
import { CreatePermissionPolicyDto } from '~/modules/setup/dto/create-permission-policy.dto.js';
import { CreateUserByAdminDto } from '~/modules/setup/dto/create-user-by-admin.dto.js';
import { ListUsersQueryDto } from '~/modules/setup/dto/list-users-query.dto.js';
import { ReplaceUserPoliciesDto } from '~/modules/setup/dto/replace-user-policies.dto.js';
import { AdminUserResponseDto } from '~/modules/setup/dto/admin-user-response.dto.js';
import { BootstrapAdminResponseDto } from '~/modules/setup/dto/bootstrap-admin-response.dto.js';
import { PermissionPolicyResponseDto } from '~/modules/setup/dto/permission-policy-response.dto.js';
import { RegistrationModeResponseDto } from '~/modules/setup/dto/registration-mode-response.dto.js';
import { ReplaceUserPoliciesResponseDto } from '~/modules/setup/dto/replace-user-policies-response.dto.js';
import { SetupStatusResponseDto } from '~/modules/setup/dto/setup-status-response.dto.js';
import { SetupUserListItemResponseDto } from '~/modules/setup/dto/setup-user-list-item-response.dto.js';
import { UpdateRegistrationModeDto } from '~/modules/setup/dto/update-registration-mode.dto.js';
import { UpdateUserRoleResponseDto } from '~/modules/setup/dto/update-user-role-response.dto.js';
import { UpdateUserRoleDto } from '~/modules/setup/dto/update-user-role.dto.js';
import { SetupService } from '~/modules/setup/setup.service.js';

@ApiTags('setup')
@Controller('setup')
export class SetupController {
  constructor(@Inject(SetupService) private readonly setupService: SetupService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get setup initialization status and registration mode' })
  @ApiOkResponse({ type: SetupStatusResponseDto })
  async getSetupStatus(): Promise<SetupStatusResponseDto> {
    const status = await this.setupService.getSetupStatus();
    return SetupStatusResponseDto.fromModel(status);
  }

  @Post('bootstrap-admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Bootstrap the first admin account during initial setup' })
  @ApiOkResponse({ type: BootstrapAdminResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed for bootstrap payload.' })
  async bootstrapAdmin(@Body() dto: BootstrapAdminDto): Promise<BootstrapAdminResponseDto> {
    const result = await this.setupService.bootstrapAdmin(dto);
    return BootstrapAdminResponseDto.fromModel(result);
  }

  @Patch('registration-mode')
  @UseGuards(AccessTokenGuard, PoliciesGuard)
  @CheckPolicies({ action: 'manage', subject: 'all' })
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Update registration mode (open or admin-only)' })
  @ApiOkResponse({ type: RegistrationModeResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed for registration mode payload.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({ description: 'Insufficient permission to manage registration mode.' })
  async updateRegistrationMode(@Body() dto: UpdateRegistrationModeDto): Promise<RegistrationModeResponseDto> {
    const result = await this.setupService.updateRegistrationMode(dto);
    return RegistrationModeResponseDto.fromModel(result);
  }

  @Post('users')
  @UseGuards(AccessTokenGuard, PoliciesGuard)
  @CheckPolicies({ action: 'create', subject: 'User' })
  @ApiBearerAuth('bearer')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a user as admin' })
  @ApiOkResponse({ type: AdminUserResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed for create-user payload.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({ description: 'Insufficient permission to create users.' })
  async createUserByAdmin(@Body() dto: CreateUserByAdminDto): Promise<AdminUserResponseDto> {
    const user = await this.setupService.createUserByAdmin(dto);
    return AdminUserResponseDto.fromModel(user);
  }

  @Get('users')
  @UseGuards(AccessTokenGuard, PoliciesGuard)
  @CheckPolicies({ action: 'read', subject: 'User' })
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'List users with assigned policy IDs' })
  @ApiOkResponse({ type: SetupUserListItemResponseDto, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({ description: 'Insufficient permission to read users.' })
  async listUsers(@Query() query: ListUsersQueryDto): Promise<SetupUserListItemResponseDto[]> {
    const users = await this.setupService.listUsers(query);
    return SetupUserListItemResponseDto.fromModels(users);
  }

  @Patch('users/:userId/role')
  @UseGuards(AccessTokenGuard, PoliciesGuard)
  @CheckPolicies({ action: 'update', subject: 'User' })
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Update role of a specific user' })
  @ApiOkResponse({ type: UpdateUserRoleResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed for userId or role payload.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({ description: 'Insufficient permission to update users.' })
  async updateUserRole(
    @Param('userId', new ParseUUIDPipe({ version: '4' })) userId: string,
    @Body() dto: UpdateUserRoleDto
  ): Promise<UpdateUserRoleResponseDto> {
    const user = await this.setupService.updateUserRole(userId, dto);
    return UpdateUserRoleResponseDto.fromModel(user);
  }

  @Get('permission-policies')
  @UseGuards(AccessTokenGuard, PoliciesGuard)
  @CheckPolicies({ action: 'read', subject: 'User' })
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'List all permission policies' })
  @ApiOkResponse({ type: PermissionPolicyResponseDto, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({ description: 'Insufficient permission to read policies.' })
  async listPermissionPolicies(): Promise<PermissionPolicyResponseDto[]> {
    const policies = await this.setupService.listPermissionPolicies();
    return PermissionPolicyResponseDto.fromModels(policies);
  }

  @Post('permission-policies')
  @UseGuards(AccessTokenGuard, PoliciesGuard)
  @CheckPolicies({ action: 'create', subject: 'User' })
  @ApiBearerAuth('bearer')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a permission policy' })
  @ApiOkResponse({ type: PermissionPolicyResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed for permission policy payload.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({ description: 'Insufficient permission to create policies.' })
  async createPermissionPolicy(@Body() dto: CreatePermissionPolicyDto): Promise<PermissionPolicyResponseDto> {
    const policy = await this.setupService.createPermissionPolicy(dto);
    return PermissionPolicyResponseDto.fromModel(policy);
  }

  @Put('users/:userId/policies')
  @UseGuards(AccessTokenGuard, PoliciesGuard)
  @CheckPolicies({ action: 'update', subject: 'User' })
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Replace policy assignments for a user' })
  @ApiOkResponse({ type: ReplaceUserPoliciesResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed for userId or policy payload.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({ description: 'Insufficient permission to update policies.' })
  async replaceUserPolicies(
    @Param('userId', new ParseUUIDPipe({ version: '4' })) userId: string,
    @Body() dto: ReplaceUserPoliciesDto
  ): Promise<ReplaceUserPoliciesResponseDto> {
    const result = await this.setupService.replaceUserPolicies(userId, dto);
    return ReplaceUserPoliciesResponseDto.fromModel(result);
  }
}
