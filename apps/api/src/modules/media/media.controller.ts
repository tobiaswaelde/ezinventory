import { Controller, Delete, FileTypeValidator, Get, Inject, MaxFileSizeValidator, Param, ParseFilePipe, ParseUUIDPipe, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiConsumes, ApiCreatedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import prismaClient from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';

import { CurrentUser } from '~/modules/auth/decorators/current-user.decorator.js';
import { AccessTokenGuard } from '~/modules/auth/guards/access-token.guard.js';
import { ListMediaLibraryQueryDto } from '~/modules/media/dto/list-media-library-query.dto.js';
import { MediaService, type StorageHealthResult, type UploadedImageFile, type UploadedImageResult } from '~/modules/media/media.service.js';
import type { AuthenticatedUser } from '~/modules/auth/types/authenticated-user.type.js';

const { AttachmentOwnerType } = prismaClient as typeof import('@prisma/client');

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

  @Get('library')
  @ApiOperation({ summary: 'List personal media library items for the current user' })
  @ApiOkResponse({
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          ownerType: { type: 'string', enum: Object.values(AttachmentOwnerType) },
          ownerId: { type: 'string', format: 'uuid' },
          fileName: { type: 'string' },
          mimeType: { type: 'string' },
          sizeBytes: { type: 'number', example: 128000 },
          storageKey: { type: 'string' },
          uploadedByUserId: { type: 'string', format: 'uuid' },
          createdAt: { type: 'string', format: 'date-time' },
          url: { type: 'string' }
        }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Validation failed for media library query.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  async listLibrary(@Query() query: ListMediaLibraryQueryDto, @CurrentUser() user: AuthenticatedUser): Promise<Array<Record<string, unknown>>> {
    return await this.mediaService.listUserLibrary(query, user.id);
  }

  @Post('items/:itemId/images')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload an image for an item to RustFS and persist attachment metadata' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary'
        }
      }
    }
  })
  @ApiCreatedResponse({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        ownerType: { type: 'string', example: 'ITEM' },
        ownerId: { type: 'string', format: 'uuid' },
        fileName: { type: 'string' },
        mimeType: { type: 'string' },
        sizeBytes: { type: 'number', example: 128000 },
        storageKey: { type: 'string' },
        url: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Missing file, invalid file type, or invalid owner id.' })
  @ApiNotFoundResponse({ description: 'Item not found.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  async uploadItemImage(
    @Param('itemId', new ParseUUIDPipe({ version: '4' })) itemId: string,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
        validators: [
          new FileTypeValidator({ fileType: /^image\// }),
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 })
        ]
      })
    )
    file: UploadedImageFile,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<UploadedImageResult> {
    return await this.mediaService.uploadOwnerImage(AttachmentOwnerType.ITEM, itemId, file, user.id);
  }

  @Post('containers/:containerId/images')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload an image for a container to RustFS and persist attachment metadata' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary'
        }
      }
    }
  })
  @ApiCreatedResponse({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        ownerType: { type: 'string', example: 'CONTAINER' },
        ownerId: { type: 'string', format: 'uuid' },
        fileName: { type: 'string' },
        mimeType: { type: 'string' },
        sizeBytes: { type: 'number', example: 128000 },
        storageKey: { type: 'string' },
        url: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Missing file, invalid file type, or invalid owner id.' })
  @ApiNotFoundResponse({ description: 'Container not found.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  async uploadContainerImage(
    @Param('containerId', new ParseUUIDPipe({ version: '4' })) containerId: string,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
        validators: [
          new FileTypeValidator({ fileType: /^image\// }),
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 })
        ]
      })
    )
    file: UploadedImageFile,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<UploadedImageResult> {
    return await this.mediaService.uploadOwnerImage(AttachmentOwnerType.CONTAINER, containerId, file, user.id);
  }

  @Put('images/:attachmentId')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Replace an existing uploaded image (owner relation stays unchanged)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary'
        }
      }
    }
  })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        ownerType: { type: 'string' },
        ownerId: { type: 'string', format: 'uuid' },
        fileName: { type: 'string' },
        mimeType: { type: 'string' },
        sizeBytes: { type: 'number' },
        storageKey: { type: 'string' },
        url: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Missing file, invalid file type, or invalid attachment id.' })
  @ApiNotFoundResponse({ description: 'Image not found.' })
  @ApiForbiddenResponse({ description: 'Only own uploads can be replaced.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  async replaceImage(
    @Param('attachmentId', new ParseUUIDPipe({ version: '4' })) attachmentId: string,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
        validators: [
          new FileTypeValidator({ fileType: /^image\// }),
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 })
        ]
      })
    )
    file: UploadedImageFile,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<UploadedImageResult> {
    return await this.mediaService.replaceImage(attachmentId, file, user.id);
  }

  @Delete('images/:attachmentId')
  @ApiOperation({ summary: 'Delete an uploaded image from RustFS and metadata from database' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        deleted: { type: 'boolean', example: true }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Image not found.' })
  @ApiForbiddenResponse({ description: 'Only own uploads can be deleted.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  async deleteImage(
    @Param('attachmentId', new ParseUUIDPipe({ version: '4' })) attachmentId: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<{ id: string; deleted: true }> {
    return await this.mediaService.deleteImage(attachmentId, user.id);
  }
}
