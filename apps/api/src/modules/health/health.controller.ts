import { Controller, Get, Version, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiTag } from '~/config/api';
import { HealthStatus } from '~/types/modules/health/health-status';
import { HealthStatusDto } from '~/types/modules/health/health-status.dto';

@ApiTags(ApiTag.Health)
@Controller(ApiTag.Health)
export class HealthController {
  @Get('/')
  @Version(VERSION_NEUTRAL)
  @ApiOperation({
    summary: 'Get health status',
    description:
      'Get the health status of the application. Also returns the current version and uptime.',
  })
  @ApiOkResponse({ description: 'Health status', type: HealthStatusDto })
  async getHealth() {
    return new HealthStatusDto({
      name: process.env.npm_package_name,
      version: process.env.npm_package_version,
      status: HealthStatus.Online,
      description: process.env.npm_package_description,
      author: {
        name: process.env.npm_package_author_name,
        email: process.env.npm_package_author_email,
        url: process.env.npm_package_author_url,
      },
      uptime: process.uptime(),
    });
  }
}
