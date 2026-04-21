import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { AccessTokenGuard } from '~/modules/auth/guards/access-token.guard.js';
import { MediaService, type StorageHealthResult } from '~/modules/media/media.service.js';

@ApiTags('media')
@Controller('media')
@UseGuards(AccessTokenGuard)
@ApiBearerAuth('bearer')
export class MediaController {
  constructor(@Inject(MediaService) private readonly mediaService: MediaService) {}

  @Get('storage/health')
  @ApiOperation({ summary: 'Check RustFS storage connectivity and configuration' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        configured: { type: 'boolean', example: true },
        endpoint: { type: 'string', example: 'http://localhost:9000' },
        bucket: { type: 'string', example: 'ezinventory-media' },
        reachable: { type: 'boolean', example: true },
        statusCode: { type: 'number', nullable: true, example: 200 }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  async storageHealth(): Promise<StorageHealthResult> {
    return await this.mediaService.getStorageHealth();
  }
}
