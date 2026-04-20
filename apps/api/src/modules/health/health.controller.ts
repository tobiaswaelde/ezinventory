import { Controller, Get, VERSION_NEUTRAL, Version } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { HealthStatusDto } from '~/modules/health/dto/health-status.dto.js';
import { HealthStatus } from '~/modules/health/dto/health-status.js';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get('/')
  @Version(VERSION_NEUTRAL)
  @ApiOperation({
    summary: 'Get health status',
    description: 'Get the health status of the application. Also returns the current version and uptime.'
  })
  @ApiOkResponse({ description: 'Health status', type: HealthStatusDto })
  async getHealth(): Promise<HealthStatusDto> {
    return new HealthStatusDto({
      name: process.env.npm_package_name ?? '@ezinventory/api',
      version: process.env.npm_package_version,
      status: HealthStatus.Online,
      description: process.env.npm_package_description,
      author: {
        name: process.env.npm_package_author_name,
        email: process.env.npm_package_author_email,
        url: process.env.npm_package_author_url
      },
      uptime: process.uptime()
    });
  }
}
