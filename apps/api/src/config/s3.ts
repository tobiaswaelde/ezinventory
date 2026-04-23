import { S3ClientConfig } from '@aws-sdk/client-s3';
import { ENV } from '~/config/env';

/**
 * S3 Client Configuration
 */
export const s3ClientConfig: S3ClientConfig = {
  endpoint: ENV.S3_ENDPOINT,
  region: 'eu-west-1',
  forcePathStyle: true,
  credentials: {
    accessKeyId: ENV.S3_ACCESS_KEY_ID,
    secretAccessKey: ENV.S3_SECRET_KEY,
  },
};

export enum S3Bucket {
  Avatars = 'avatars',
}
