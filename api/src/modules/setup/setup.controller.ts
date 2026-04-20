import { Body, Controller, HttpCode, HttpStatus, Inject, Patch, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { BootstrapAdminDto } from '~/modules/setup/dto/bootstrap-admin.dto.js';
import { RegistrationMode, UpdateRegistrationModeDto } from '~/modules/setup/dto/update-registration-mode.dto.js';
import { SetupService } from '~/modules/setup/setup.service.js';

@ApiTags('setup')
@Controller('setup')
export class SetupController {
  constructor(@Inject(SetupService) private readonly setupService: SetupService) {}

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
}
