import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse
} from '@nestjs/swagger';

import { CheckPolicies } from '~/modules/auth/casl/check-policies.decorator.js';
import { AccessTokenGuard } from '~/modules/auth/guards/access-token.guard.js';
import { PoliciesGuard } from '~/modules/auth/guards/policies.guard.js';
import { CreateLocationDto } from '~/modules/locations/dto/create-location.dto.js';
import { LocationResponseDto } from '~/modules/locations/dto/location-response.dto.js';
import { LocationsService } from '~/modules/locations/locations.service.js';

@ApiTags('locations')
@Controller('locations')
@UseGuards(AccessTokenGuard, PoliciesGuard)
@ApiBearerAuth('bearer')
export class LocationsController {
  constructor(@Inject(LocationsService) private readonly locationsService: LocationsService) {}

  @Post()
  @CheckPolicies({ action: 'create', subject: 'Location' })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new top-level location' })
  @ApiCreatedResponse({ type: LocationResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed for location payload.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({ description: 'Insufficient permission to create locations.' })
  async createLocation(@Body() dto: CreateLocationDto): Promise<LocationResponseDto> {
    const created = await this.locationsService.createLocation(dto);
    return LocationResponseDto.fromModel(created);
  }

  @Get()
  @CheckPolicies({ action: 'read', subject: 'Location' })
  @ApiOperation({ summary: 'List all locations' })
  @ApiOkResponse({ type: LocationResponseDto, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({ description: 'Insufficient permission to read locations.' })
  async listLocations(): Promise<LocationResponseDto[]> {
    const items = await this.locationsService.listLocations();
    return LocationResponseDto.fromModels(items);
  }
}
