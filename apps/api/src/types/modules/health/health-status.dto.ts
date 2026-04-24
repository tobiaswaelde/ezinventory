import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { HealthStatus } from '~/types/modules/health/health-status';

export class HealthStatusDto {
  @Expose()
  @ApiProperty({ example: process.env.npm_package_name })
  name: string;

  @Expose()
  @ApiProperty({ example: process.env.npm_package_version })
  version: string;

  @Expose()
  @ApiProperty({ enum: HealthStatus })
  status: HealthStatus;

  @Expose()
  @ApiProperty({ example: process.env.npm_package_description })
  description?: string;

  @Expose()
  @ApiProperty({
    type: 'object',
    properties: {
      name: { type: 'string', required: false },
      email: { type: 'string', required: false },
      url: { type: 'string', required: false },
    },
    example: {
      name: process.env.npm_package_author_name,
      email: process.env.npm_package_author_email,
      url: process.env.npm_package_author_url,
    },
  })
  author?: {
    name?: string;
    email?: string;
    url?: string;
  };

  @Expose()
  @ApiProperty({ description: 'Uptime in seconds', example: 12345.1234567 })
  uptime: number;

  @Expose()
  @ApiProperty({ description: 'Uptime formatted as HHh MMm SSs', example: '3h 25m 45s' })
  get uptimeFormatted(): string {
    if (!this.uptime) return undefined;
    const h = Math.floor(this.uptime / 3600);
    const m = Math.floor((this.uptime % 3600) / 60);
    const s = Math.floor(this.uptime % 60);
    return `${h}h ${m}m ${s}s`;
  }

  constructor(partial: Partial<HealthStatusDto>) {
    Object.assign(this, partial);
  }
}
