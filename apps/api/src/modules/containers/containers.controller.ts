import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, Query, UseGuards } from '@nestjs/common';
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
import { ContainersService, type ContainerResponse } from '~/modules/containers/containers.service.js';
import { CreateContainerDto } from '~/modules/containers/dto/create-container.dto.js';
import { ListContainersQueryDto } from '~/modules/containers/dto/list-containers-query.dto.js';

@ApiTags('containers')
@Controller('containers')
@UseGuards(AccessTokenGuard, PoliciesGuard)
@ApiBearerAuth('bearer')
export class ContainersController {
  constructor(@Inject(ContainersService) private readonly containersService: ContainersService) {}

  @Post()
  @CheckPolicies({ action: 'create', subject: 'Container' })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new container under a location or parent container' })
  @ApiCreatedResponse({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        locationId: { type: 'string', format: 'uuid' },
        parentContainerId: { type: 'string', format: 'uuid', nullable: true },
        type: { type: 'string' },
        name: { type: 'string' },
        code: { type: 'string' },
        qrCodeValue: { type: 'string' },
        description: { type: 'string', nullable: true },
        iconSet: { type: 'string', nullable: true },
        iconName: { type: 'string', nullable: true },
        isActive: { type: 'boolean' }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Validation failed for container payload.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({ description: 'Insufficient permission to create containers.' })
  async createContainer(@Body() dto: CreateContainerDto): Promise<ContainerResponse> {
    return await this.containersService.createContainer(dto);
  }

  @Get()
  @CheckPolicies({ action: 'read', subject: 'Container' })
  @ApiOperation({ summary: 'List containers, optionally filtered by location' })
  @ApiOkResponse({
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          locationId: { type: 'string', format: 'uuid' },
          parentContainerId: { type: 'string', format: 'uuid', nullable: true },
          type: { type: 'string' },
          name: { type: 'string' },
          code: { type: 'string' },
          qrCodeValue: { type: 'string' },
          description: { type: 'string', nullable: true },
          iconSet: { type: 'string', nullable: true },
          iconName: { type: 'string', nullable: true },
          isActive: { type: 'boolean' }
        }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Validation failed for query params.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({ description: 'Insufficient permission to read containers.' })
  async listContainers(@Query() query: ListContainersQueryDto): Promise<ContainerResponse[]> {
    return await this.containersService.listContainers(query.locationId);
  }
}
