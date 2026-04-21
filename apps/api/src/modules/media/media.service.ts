import { Injectable } from '@nestjs/common';

import { ENV } from '~/config/env.js';

export type StorageHealthResult = {
  configured: boolean;
  endpoint: string;
  bucket: string;
  reachable: boolean;
  statusCode: number | null;
};

@Injectable()
export class MediaService {
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
}
