import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Param, ParseUUIDPipe, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import type { CaslAction, CaslSubject } from '~/modules/auth/casl/casl-ability.types.js';
import { CheckPolicies } from '~/modules/auth/casl/check-policies.decorator.js';
import { AccessTokenGuard } from '~/modules/auth/guards/access-token.guard.js';
import { PoliciesGuard } from '~/modules/auth/guards/policies.guard.js';
import { BootstrapAdminDto } from '~/modules/setup/dto/bootstrap-admin.dto.js';
import { CreatePermissionPolicyDto } from '~/modules/setup/dto/create-permission-policy.dto.js';
import { CreateUserByAdminDto } from '~/modules/setup/dto/create-user-by-admin.dto.js';
import { ReplaceUserPoliciesDto } from '~/modules/setup/dto/replace-user-policies.dto.js';
import { RegistrationMode, UpdateRegistrationModeDto } from '~/modules/setup/dto/update-registration-mode.dto.js';
import { UpdateUserRoleDto } from '~/modules/setup/dto/update-user-role.dto.js';
import { SetupService } from '~/modules/setup/setup.service.js';

@ApiTags('setup')
@Controller('setup')
export class SetupController {
  constructor(@Inject(SetupService) private readonly setupService: SetupService) {}

  @Get('status')
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        setupInitialized: { type: 'boolean', example: true },
        registrationMode: { type: 'string', enum: ['OPEN', 'ADMIN_ONLY'], example: 'ADMIN_ONLY' }
      }
    }
  })
  async getSetupStatus(): Promise<{ setupInitialized: boolean; registrationMode: RegistrationMode }> {
    return await this.setupService.getSetupStatus();
  }

  @Post('bootstrap-admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        setupInitialized: { type: 'boolean', example: true },
        adminUserId: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' }
      }
    }
  })
  async bootstrapAdmin(
    @Body() dto: BootstrapAdminDto
  ): Promise<{ setupInitialized: true; adminUserId: string; email: string }> {
    return await this.setupService.bootstrapAdmin(dto);
  }

  @Patch('registration-mode')
  @UseGuards(AccessTokenGuard, PoliciesGuard)
  @CheckPolicies({ action: 'manage', subject: 'all' })
  @ApiBearerAuth('bearer')
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        mode: { type: 'string', enum: ['OPEN', 'ADMIN_ONLY'], example: 'ADMIN_ONLY' }
      }
    }
  })
  async updateRegistrationMode(@Body() dto: UpdateRegistrationModeDto): Promise<{ mode: RegistrationMode }> {
    return await this.setupService.updateRegistrationMode(dto);
  }

  @Post('users')
  @UseGuards(AccessTokenGuard, PoliciesGuard)
  @CheckPolicies({ action: 'create', subject: 'User' })
  @ApiBearerAuth('bearer')
  @HttpCode(HttpStatus.CREATED)
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440777' },
        email: { type: 'string', example: 'team.member@example.com' },
        role: { type: 'string', enum: Object.values(UserRole), example: 'STAFF' }
      }
    }
  })
  async createUserByAdmin(@Body() dto: CreateUserByAdminDto): Promise<{ id: string; email: string; role: UserRole }> {
    return await this.setupService.createUserByAdmin(dto);
  }

  @Get('users')
  @UseGuards(AccessTokenGuard, PoliciesGuard)
  @CheckPolicies({ action: 'read', subject: 'User' })
  @ApiBearerAuth('bearer')
  @ApiOkResponse({
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string' },
          displayName: { type: 'string' },
          role: { type: 'string', enum: Object.values(UserRole) },
          preferredLanguage: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          policyIds: { type: 'array', items: { type: 'string', format: 'uuid' } }
        }
      }
    }
  })
  async listUsers(): Promise<
    Array<{
      id: string;
      email: string;
      displayName: string;
      role: UserRole;
      preferredLanguage: string;
      createdAt: Date;
      updatedAt: Date;
      policyIds: string[];
    }>
  > {
    return await this.setupService.listUsers();
  }

  @Patch('users/:userId/role')
  @UseGuards(AccessTokenGuard, PoliciesGuard)
  @CheckPolicies({ action: 'update', subject: 'User' })
  @ApiBearerAuth('bearer')
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        role: { type: 'string', enum: Object.values(UserRole) }
      }
    }
  })
  async updateUserRole(
    @Param('userId', new ParseUUIDPipe({ version: '4' })) userId: string,
    @Body() dto: UpdateUserRoleDto
  ): Promise<{ id: string; role: UserRole }> {
    return await this.setupService.updateUserRole(userId, dto);
  }

  @Get('permission-policies')
  @UseGuards(AccessTokenGuard, PoliciesGuard)
  @CheckPolicies({ action: 'read', subject: 'User' })
  @ApiBearerAuth('bearer')
  @ApiOkResponse({
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          action: { type: 'string' },
          subject: { type: 'string' },
          inverted: { type: 'boolean' },
          conditions: { nullable: true },
          reason: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  })
  async listPermissionPolicies(): Promise<
    Array<{
      id: string;
      action: CaslAction;
      subject: CaslSubject;
      inverted: boolean;
      conditions: unknown;
      reason: string | null;
      createdAt: Date;
    }>
  > {
    return await this.setupService.listPermissionPolicies();
  }

  @Post('permission-policies')
  @UseGuards(AccessTokenGuard, PoliciesGuard)
  @CheckPolicies({ action: 'create', subject: 'User' })
  @ApiBearerAuth('bearer')
  @HttpCode(HttpStatus.CREATED)
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        action: { type: 'string' },
        subject: { type: 'string' },
        inverted: { type: 'boolean' },
        conditions: { nullable: true },
        reason: { type: 'string', nullable: true },
        createdAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  async createPermissionPolicy(
    @Body() dto: CreatePermissionPolicyDto
  ): Promise<{ id: string; action: CaslAction; subject: CaslSubject; inverted: boolean; conditions: unknown; reason: string | null; createdAt: Date }> {
    return await this.setupService.createPermissionPolicy(dto);
  }

  @Put('users/:userId/policies')
  @UseGuards(AccessTokenGuard, PoliciesGuard)
  @CheckPolicies({ action: 'update', subject: 'User' })
  @ApiBearerAuth('bearer')
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', format: 'uuid' },
        policyIds: { type: 'array', items: { type: 'string', format: 'uuid' } }
      }
    }
  })
  async replaceUserPolicies(
    @Param('userId', new ParseUUIDPipe({ version: '4' })) userId: string,
    @Body() dto: ReplaceUserPoliciesDto
  ): Promise<{ userId: string; policyIds: string[] }> {
    return await this.setupService.replaceUserPolicies(userId, dto);
  }
}
