import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { CheckPolicies } from '~/modules/auth/casl/check-policies.decorator.js';
import { AccessTokenGuard } from '~/modules/auth/guards/access-token.guard.js';
import { PoliciesGuard } from '~/modules/auth/guards/policies.guard.js';
import { BootstrapAdminDto } from '~/modules/setup/dto/bootstrap-admin.dto.js';
import { CreateUserByAdminDto } from '~/modules/setup/dto/create-user-by-admin.dto.js';
import { RegistrationMode, UpdateRegistrationModeDto } from '~/modules/setup/dto/update-registration-mode.dto.js';
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
}
