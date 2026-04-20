import { Body, Controller, HttpCode, HttpStatus, Patch, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { BootstrapAdminDto } from './dto/bootstrap-admin.dto.js';
import { UpdateRegistrationModeDto } from './dto/update-registration-mode.dto.js';

@ApiTags('setup')
@Controller('setup')
export class SetupController {
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
  bootstrapAdmin(@Body() dto: BootstrapAdminDto): { setupInitialized: true; adminUserId: string; email: string } {
    return {
      setupInitialized: true,
      adminUserId: crypto.randomUUID(),
      email: dto.email
    };
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
  updateRegistrationMode(@Body() dto: UpdateRegistrationModeDto): { mode: string } {
    return { mode: dto.mode };
  }
}
