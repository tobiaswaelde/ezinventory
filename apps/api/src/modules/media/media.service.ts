import { BadGatewayException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import prismaClient from '@prisma/client';
import type { AttachmentOwnerType as AttachmentOwnerTypeType, Prisma as PrismaType } from '@prisma/client';

import { ENV } from '~/config/env.js';
import type { ListMediaLibraryQueryDto, MediaLibrarySortableField } from '~/modules/media/dto/list-media-library-query.dto.js';
import { PrismaService } from '~/prisma/prisma.service.js';

const { AttachmentOwnerType } = prismaClient as typeof import('@prisma/client');

const MEDIA_LIBRARY_ALLOWED_FIELDS = [
  'id',
  'ownerType',
  'ownerId',
  'fileName',
  'mimeType',
  'sizeBytes',
  'storageKey',
  'uploadedByUserId',
  'createdAt',
  'url'
] as const;

type MediaLibraryAllowedField = (typeof MEDIA_LIBRARY_ALLOWED_FIELDS)[number];

type StoredImageAttachment = {
  id: string;
  ownerType: AttachmentOwnerTypeType;
  ownerId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
  uploadedByUserId: string;
  createdAt: Date;
};

export type UploadedImageFile = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

export type StorageHealthResult = {
  configured: boolean;
  endpoint: string;
  bucket: string;
  reachable: boolean;
  statusCode: number | null;
};

export type UploadedImageResult = {
  id: string;
  ownerType: AttachmentOwnerTypeType;
  ownerId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
  url: string;
  createdAt: Date;
};

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

  async getStorageHealth(): Promise<StorageHealthResult> {
    const endpoint = ENV.RUSTFS_ENDPOINT;
    const bucket = ENV.RUSTFS_BUCKET;

    if (!endpoint || !bucket) {
      return {
        configured: false,
        endpoint,
        bucket,
        reachable: false,
        statusCode: null
      };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        signal: controller.signal
      });

      return {
        configured: true,
        endpoint,
        bucket,
        reachable: response.ok,
        statusCode: response.status
      };
    } catch {
      return {
        configured: true,
        endpoint,
        bucket,
        reachable: false,
        statusCode: null
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  async uploadOwnerImage(
    ownerType: 'ITEM' | 'CONTAINER',
    ownerId: string,
    file: UploadedImageFile,
    uploadedByUserId: string
  ): Promise<UploadedImageResult> {
    await this.assertOwnerExists(ownerType, ownerId);

    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storageKey = `${ownerType.toLowerCase()}/${ownerId}/${Date.now()}-${safeName}`;

    await this.uploadObject(storageKey, file);

    const created = await this.prisma.imageAttachment.create({
      data: {
        ownerType,
        ownerId,
        fileName: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        storageKey,
        uploadedByUserId
      }
    });

    return this.toUploadedImageResponse(created);
  }

  async listUserLibrary(query: ListMediaLibraryQueryDto, userId: string): Promise<Array<Record<string, unknown>>> {
    const fields = this.parseLibraryFields(query.fields);

    const rows = await this.prisma.imageAttachment.findMany({
      where: this.buildLibraryWhere(query, userId),
      orderBy: [this.buildLibraryOrderBy(query.sortBy, query.sortDir)],
      take: query.limit ?? 50
    });

    return rows.map((row) => this.projectLibraryRow(row as StoredImageAttachment, fields));
  }

  async deleteImage(attachmentId: string, userId: string): Promise<{ id: string; deleted: true }> {
    const attachment = await this.prisma.imageAttachment.findUnique({
      where: { id: attachmentId },
      select: {
        id: true,
        storageKey: true,
        uploadedByUserId: true
      }
    });

    if (!attachment) {
      throw new NotFoundException('Image not found.');
    }

    if (attachment.uploadedByUserId !== userId) {
      throw new ForbiddenException('You can only delete your own uploaded images.');
    }

    await this.deleteObject(attachment.storageKey);
    await this.prisma.imageAttachment.delete({ where: { id: attachmentId } });

    return {
      id: attachmentId,
      deleted: true
    };
  }

  async replaceImage(attachmentId: string, file: UploadedImageFile, userId: string): Promise<UploadedImageResult> {
    const attachment = await this.prisma.imageAttachment.findUnique({
      where: { id: attachmentId },
      select: {
        id: true,
        ownerType: true,
        ownerId: true,
        storageKey: true,
        uploadedByUserId: true
      }
    });

    if (!attachment) {
      throw new NotFoundException('Image not found.');
    }

    if (attachment.uploadedByUserId !== userId) {
      throw new ForbiddenException('You can only replace your own uploaded images.');
    }

    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const newStorageKey = `${attachment.ownerType.toLowerCase()}/${attachment.ownerId}/${Date.now()}-${safeName}`;

    await this.uploadObject(newStorageKey, file);

    const updated = await this.prisma.imageAttachment.update({
      where: { id: attachmentId },
      data: {
        fileName: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        storageKey: newStorageKey,
        uploadedByUserId: userId
      }
    });

    if (updated.storageKey !== attachment.storageKey) {
      void this.deleteObject(attachment.storageKey);
    }

    return this.toUploadedImageResponse(updated);
  }

  private toUploadedImageResponse(row: StoredImageAttachment): UploadedImageResult {
    return {
      id: row.id,
      ownerType: row.ownerType,
      ownerId: row.ownerId,
      fileName: row.fileName,
      mimeType: row.mimeType,
      sizeBytes: row.sizeBytes,
      storageKey: row.storageKey,
      url: this.buildPublicUrl(row.storageKey),
      createdAt: row.createdAt
    };
  }

  private parseLibraryFields(rawFields?: string): Set<MediaLibraryAllowedField> {
    const requested = new Set<MediaLibraryAllowedField>(['id']);

    if (!rawFields) {
      for (const field of MEDIA_LIBRARY_ALLOWED_FIELDS) {
        requested.add(field);
      }

      return requested;
    }

    const tokens = rawFields
      .split(',')
      .map((token) => token.trim())
      .filter(Boolean);

    for (const token of tokens) {
      if ((MEDIA_LIBRARY_ALLOWED_FIELDS as readonly string[]).includes(token)) {
        requested.add(token as MediaLibraryAllowedField);
      }
    }

    return requested;
  }

  private projectLibraryRow(row: StoredImageAttachment, fields: Set<MediaLibraryAllowedField>): Record<string, unknown> {
    return {
      ...(fields.has('id') ? { id: row.id } : {}),
      ...(fields.has('ownerType') ? { ownerType: row.ownerType } : {}),
      ...(fields.has('ownerId') ? { ownerId: row.ownerId } : {}),
      ...(fields.has('fileName') ? { fileName: row.fileName } : {}),
      ...(fields.has('mimeType') ? { mimeType: row.mimeType } : {}),
      ...(fields.has('sizeBytes') ? { sizeBytes: row.sizeBytes } : {}),
      ...(fields.has('storageKey') ? { storageKey: row.storageKey } : {}),
      ...(fields.has('uploadedByUserId') ? { uploadedByUserId: row.uploadedByUserId } : {}),
      ...(fields.has('createdAt') ? { createdAt: row.createdAt } : {}),
      ...(fields.has('url') ? { url: this.buildPublicUrl(row.storageKey) } : {})
    };
  }

  private buildLibraryWhere(query: ListMediaLibraryQueryDto, userId: string): PrismaType.ImageAttachmentWhereInput {
    const clauses: PrismaType.ImageAttachmentWhereInput[] = [{ uploadedByUserId: userId }];

    if (query.ownerType) {
      clauses.push({ ownerType: query.ownerType });
    }

    if (query.ownerId?.trim()) {
      clauses.push({ ownerId: query.ownerId.trim() });
    }

    if (query.search?.trim()) {
      clauses.push({ fileName: { contains: query.search.trim(), mode: 'insensitive' } });
    }

    if (clauses.length === 1) {
      return clauses[0] as PrismaType.ImageAttachmentWhereInput;
    }

    return {
      AND: clauses
    };
  }

  private buildLibraryOrderBy(
    sortBy: MediaLibrarySortableField | undefined,
    sortDir: 'asc' | 'desc' | undefined
  ): PrismaType.ImageAttachmentOrderByWithRelationInput {
    return {
      [sortBy ?? 'createdAt']: sortDir ?? 'desc'
    };
  }

  private async assertOwnerExists(ownerType: 'ITEM' | 'CONTAINER', ownerId: string): Promise<void> {
    if (ownerType === AttachmentOwnerType.ITEM) {
      const item = await this.prisma.item.findUnique({
        where: { id: ownerId },
        select: { id: true }
      });

      if (!item) {
        throw new NotFoundException('Item not found.');
      }

      return;
    }

    const container = await this.prisma.container.findUnique({
      where: { id: ownerId },
      select: { id: true }
    });

    if (!container) {
      throw new NotFoundException('Container not found.');
    }
  }

  private buildObjectUrl(storageKey: string): string {
    const endpoint = ENV.RUSTFS_ENDPOINT.replace(/\/$/, '');
    const bucket = ENV.RUSTFS_BUCKET;

    return `${endpoint}/${bucket}/${storageKey}`;
  }

  private buildPublicUrl(storageKey: string): string {
    const publicBaseUrl = ENV.RUSTFS_PUBLIC_BASE_URL.replace(/\/$/, '');

    return `${publicBaseUrl}/${ENV.RUSTFS_BUCKET}/${storageKey}`;
  }

  private async uploadObject(storageKey: string, file: UploadedImageFile): Promise<void> {
    const response = await fetch(this.buildObjectUrl(storageKey), {
      method: 'PUT',
      headers: {
        'content-type': file.mimetype
      },
      body: file.buffer as unknown as BodyInit
    });

    if (!response.ok) {
      throw new BadGatewayException('Failed to upload image to RustFS.');
    }
  }

  private async deleteObject(storageKey: string): Promise<void> {
    const response = await fetch(this.buildObjectUrl(storageKey), {
      method: 'DELETE'
    });

    if (!response.ok && response.status !== 404) {
      throw new BadGatewayException('Failed to delete image from RustFS.');
    }
  }
}
