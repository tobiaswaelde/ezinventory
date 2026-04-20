import { Controller, Get, VERSION_NEUTRAL, Version } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

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
  @ApiOkResponse({
    description: 'Health status',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: '@ezinventory/api' },
        version: { type: 'string', example: '0.1.0' },
        status: { type: 'string', enum: Object.values(HealthStatus), example: HealthStatus.Online },
        description: { type: 'string', nullable: true, example: 'EZ Inventory API' },
        author: {
          type: 'object',
          nullable: true,
          properties: {
            name: { type: 'string', nullable: true },
            email: { type: 'string', nullable: true },
            url: { type: 'string', nullable: true }
          }
        },
        uptime: { type: 'number', example: 12345.1234567 },
        uptimeFormatted: { type: 'string', example: '3h 25m 45s' }
      }
    }
  })
  async getHealth(): Promise<{
    name: string;
    version: string | undefined;
    status: HealthStatus;
    description: string | undefined;
    author: { name: string | undefined; email: string | undefined; url: string | undefined };
    uptime: number;
    uptimeFormatted: string;
  }> {
    const uptime = process.uptime();

    return {
      name: process.env.npm_package_name ?? '@ezinventory/api',
      version: process.env.npm_package_version,
      status: HealthStatus.Online,
      description: process.env.npm_package_description,
      author: {
        name: process.env.npm_package_author_name,
        email: process.env.npm_package_author_email,
        url: process.env.npm_package_author_url
      },
      uptime,
      uptimeFormatted: formatUptime(uptime)
    };
  }
}

function formatUptime(uptimeInSeconds: number): string {
  const h = Math.floor(uptimeInSeconds / 3600);
  const m = Math.floor((uptimeInSeconds % 3600) / 60);
  const s = Math.floor(uptimeInSeconds % 60);
  return `${h}h ${m}m ${s}s`;
}
