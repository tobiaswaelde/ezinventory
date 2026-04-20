import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { CheckPolicies } from '~/modules/auth/casl/check-policies.decorator.js';
import { AccessTokenGuard } from '~/modules/auth/guards/access-token.guard.js';
import { PoliciesGuard } from '~/modules/auth/guards/policies.guard.js';
import { CreateLocationDto } from '~/modules/locations/dto/create-location.dto.js';
import { type LocationResponse, LocationsService } from '~/modules/locations/locations.service.js';

@ApiTags('locations')
@Controller('locations')
@UseGuards(AccessTokenGuard, PoliciesGuard)
@ApiBearerAuth('bearer')
export class LocationsController {
  constructor(@Inject(LocationsService) private readonly locationsService: LocationsService) {}

  @Post()
  @CheckPolicies({ action: 'create', subject: 'Location' })
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string' },
        code: { type: 'string' },
        description: { type: 'string', nullable: true },
        iconSet: { type: 'string', nullable: true },
        iconName: { type: 'string', nullable: true },
        isActive: { type: 'boolean' }
      }
    }
  })
  async createLocation(@Body() dto: CreateLocationDto): Promise<LocationResponse> {
    return await this.locationsService.createLocation(dto);
  }

  @Get()
  @CheckPolicies({ action: 'read', subject: 'Location' })
  @ApiOkResponse({
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          code: { type: 'string' },
          description: { type: 'string', nullable: true },
          iconSet: { type: 'string', nullable: true },
          iconName: { type: 'string', nullable: true },
          isActive: { type: 'boolean' }
        }
      }
    }
  })
  async listLocations(): Promise<LocationResponse[]> {
    return await this.locationsService.listLocations();
  }
}
