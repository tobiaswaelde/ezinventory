import { GetObjectCommand, S3 } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Logger } from '@nestjs/common';
import { fileTypeFromBuffer } from 'file-type';
import { S3Bucket, s3ClientConfig } from '~/config/s3';

const s3Client = new S3(s3ClientConfig);

const logger = new Logger('S3');

/**
 * Service for interacting with S3.
 */
export class S3Service {
  /**
   * Create all buckets if not existing.
   */
  public static async createBuckets() {
    for (const bucket of Object.values(S3Bucket)) {
      await this.createBucket(bucket);
    }
  }

  /**
   * Create bucket if not existing.
   * @param {string} name The name of the bucket to create.
   */
  public static async createBucket(name: string) {
    try {
      const exists = await this.bucketExists(name);
      if (!exists) {
        // create bucket
        await s3Client.createBucket({ Bucket: name });
      }
    } catch (err) {
      logger.error(`Failed to create S3 bucket: ${name}`, err);
    }
  }

  /**
   * Upload a file to S3.
   * @param {S3Bucket} bucket The name of the bucket
   * @param {string} key The key of the file
   * @param {Buffer} file The file buffer
   * @param {Record<string, string>} tags Optional tags to set on the file
   */
  public static async uploadFile(
    bucket: S3Bucket,
    key: string,
    file: Buffer,
    tags?: Record<string, string>,
  ) {
    // extract file mime type from buffer
    const { mime } = await fileTypeFromBuffer(file);

    // upload file
    await s3Client.putObject({
      Bucket: bucket,
      Key: key,
      Body: file,
      ContentLength: file.length,
      ContentType: mime,
    });

    // set tags
    if (tags) {
      await s3Client.putObjectTagging({
        Bucket: bucket,
        Key: key,
        Tagging: {
          TagSet: Object.entries(tags).map(([Key, Value]) => ({ Key, Value })),
        },
      });
    }
  }

  /**
   * Delete a file from S3.
   * @param {S3Bucket} bucket The name of the bucket
   * @param {string} key The key of the file
   */
  public static async deleteFile(bucket: S3Bucket, key: string) {
    await s3Client.deleteObject({ Bucket: bucket, Key: key });
  }

  /**
   * Get a signed URL for a file in S3.
   * @param {S3Bucket} bucket The S3 bucket.
   * @param {string} key The key of the file.
   * @param {number} expiration The expiration time in seconds. Default is `86400` (24 hours).
   * @returns {string|null} The signed URL or `null` if the key is not provided.
   */
  public static async getFileUrl(
    bucket: S3Bucket,
    key?: string,
    expiration: number = 86400,
  ): Promise<string | null> {
    if (!key) return null;

    const cmd = new GetObjectCommand({ Bucket: bucket, Key: key });
    return getSignedUrl(s3Client, cmd, { expiresIn: expiration });
  }

  /**
   * Check if a bucket exists.
   * @param {string} name The name of the bucket to check.
   * @return `true` if the bucket exists, `false` otherwise.
   */
  private static async bucketExists(name: string): Promise<boolean> {
    try {
      await s3Client.headBucket({ Bucket: name });
      return true;
    } catch {
      return false;
    }
  }
}
