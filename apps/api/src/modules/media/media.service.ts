import { BadGatewayException, Injectable, NotFoundException } from '@nestjs/common';
import { AttachmentOwnerType } from '@prisma/client';

import { ENV } from '~/config/env.js';
import { PrismaService } from '~/prisma/prisma.service.js';

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
  ownerType: AttachmentOwnerType;
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

    const endpoint = ENV.RUSTFS_ENDPOINT.replace(/\/$/, '');
    const bucket = ENV.RUSTFS_BUCKET;
    const objectUrl = `${endpoint}/${bucket}/${storageKey}`;

    const response = await fetch(objectUrl, {
      method: 'PUT',
      headers: {
        'content-type': file.mimetype
      },
      body: file.buffer as unknown as BodyInit
    });

    if (!response.ok) {
      throw new BadGatewayException('Failed to upload image to RustFS.');
    }

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

    const publicBaseUrl = ENV.RUSTFS_PUBLIC_BASE_URL.replace(/\/$/, '');

    return {
      id: created.id,
      ownerType: created.ownerType,
      ownerId: created.ownerId,
      fileName: created.fileName,
      mimeType: created.mimeType,
      sizeBytes: created.sizeBytes,
      storageKey: created.storageKey,
      url: `${publicBaseUrl}/${bucket}/${created.storageKey}`,
      createdAt: created.createdAt
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
}
