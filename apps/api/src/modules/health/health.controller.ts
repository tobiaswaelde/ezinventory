import { Controller, Get, Inject, Version, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiTag } from '~/config/api';
import { HealthService } from '~/modules/health/health.service';
import { HealthStatusDto } from '~/types/modules/health/health-status.dto';

@ApiTags(ApiTag.Health)
@Controller(ApiTag.Health)
export class HealthController {
  constructor(@Inject(HealthService.token) private readonly healthService: HealthService) {}

  @Get('/')
  @Version(VERSION_NEUTRAL)
  @ApiOperation({
    summary: 'Get health status',
    description:
      'Get the health status of the application. Also returns the current version and uptime.',
  })
  @ApiOkResponse({ description: 'Health status', type: HealthStatusDto })
  async getHealth() {
    return this.healthService.getHealthStatus();
  }
}
