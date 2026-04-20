import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { HealthStatus } from '~/modules/health/dto/health-status.js';

class HealthAuthorDto {
  @Expose()
  @ApiProperty({ required: false, example: process.env.npm_package_author_name })
  name?: string;

  @Expose()
  @ApiProperty({ required: false, example: process.env.npm_package_author_email })
  email?: string;

  @Expose()
  @ApiProperty({ required: false, example: process.env.npm_package_author_url })
  url?: string;
}

export class HealthStatusDto {
  @Expose()
  @ApiProperty({ example: process.env.npm_package_name })
  name!: string;

  @Expose()
  @ApiProperty({ example: process.env.npm_package_version })
  version!: string;

  @Expose()
  @ApiProperty({ enum: HealthStatus })
  status!: HealthStatus;

  @Expose()
  @ApiProperty({ example: process.env.npm_package_description })
  description?: string;

  @Expose()
  @ApiProperty({
    type: 'object',
    properties: {
      name: { type: 'string', nullable: true },
      email: { type: 'string', nullable: true },
      url: { type: 'string', nullable: true }
    },
    example: {
      name: process.env.npm_package_author_name,
      email: process.env.npm_package_author_email,
      url: process.env.npm_package_author_url
    }
  })
  author?: HealthAuthorDto | undefined;

  @Expose()
  @ApiProperty({ description: 'Uptime in seconds', example: 12345.1234567 })
  uptime!: number;

  @Expose()
  @ApiProperty({ description: 'Uptime formatted as HHh MMm SSs', example: '3h 25m 45s' })
  get uptimeFormatted(): string | undefined {
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
