import { ImageFit } from '@/generated/prisma/enums';
import { FileDelegate } from '@/generated/prisma/models';
import { ErrorCode } from '@ezinventory/shared/types/error-code';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import dayjs from 'dayjs';
import sharp from 'sharp';
import { S3Bucket } from '~/config/s3';
import { QueryService } from '~/lib/query-service/query.service';
import { FileTypeMap } from '~/modules/files/types';
import { PrismaService } from '~/prisma/prisma.service';
import { S3Service } from '~/services/s3.service';
import { CaslSubject } from '~/types/casl/subject';
import { FilePayload } from '~/types/modules/files';
import { CreateFileDTO } from '~/types/modules/files/create-file.dto';

@Injectable()
export class FilesService extends QueryService<FileDelegate, FileTypeMap> {
  public static readonly token = 'FILES_SERVICE';

  private readonly logger = new Logger(FilesService.token);

  constructor(private readonly db: PrismaService) {
    super(db.file, CaslSubject.File);
  }

  /**
   * Create a new file record in the database. This does not upload the file to S3, it only creates the database record.
   * The file should be uploaded separately using the uploadFile method.
   * @param {CreateFileDTO} data Data to create the file record
   * @returns {FilePayload} Created file record
   */
  public async create(data: CreateFileDTO): Promise<FilePayload> {
    const key = crypto.randomUUID();
    const storageSeconds = data.requestedStorageDuration ?? 86400; // default to 24 hours
    const deleteAfterDate = dayjs().add(storageSeconds, 'seconds').toDate();

    return this.db.file.create({
      data: {
        bucket: S3Bucket.Files,
        key: key,
        originalFilename: data.originalFilename ?? '',
        contentType: data.contentType ?? '',
        fileSize: BigInt(data.fileSize ?? 0),
        isTemporary: data.isTemporary ?? true,
        deleteAfter: deleteAfterDate,
        width: data.width,
        height: data.height,
        quality: data.quality,
        fit: data.fit,
        isUploaded: false, // file is not uploaded yet, it will be set to true once the file is uploaded to S3
      },
    });
  }

  /**
   * Upload a file to S3 and update the corresponding file record in the database. This should be called after the create method to upload the actual file to S3.
   * @param {string} id The ID of the file record to update after uploading the file to S3
   * @param {Express.Multer.File} file The file to upload
   * @returns {FilePayload} Updated file record with isUploaded set to true and fileSize updated with the actual size of the uploaded file
   * @throws {BadRequestException} ErrorCode.FileUploadNoFileProvided
   * @throws {NotFoundException} ErrorCode.FileNotFound
   * @throws {BadRequestException} ErrorCode.FileUploadAlreadyUploaded
   * @throws {InternalServerErrorException} ErrorCode.FileUploadProcessingError
   */
  public async uploadFile(id: string, file: Express.Multer.File): Promise<FilePayload> {
    if (!file) {
      throw new BadRequestException(ErrorCode.FileUploadNoFileProvided);
    }

    return this.db.$transaction(async (tx) => {
      // find file record
      const item = await tx.file.findUnique({ where: { id } });
      if (!item) {
        throw new NotFoundException(ErrorCode.FileNotFound);
      }
      if (item.isUploaded) {
        throw new BadRequestException(ErrorCode.FileUploadAlreadyUploaded);
      }

      // upload file to S3
      const buffer = await this.prepareFileBuffer(item, file.buffer);
      await S3Service.uploadFile(S3Bucket.Files, item.key, buffer);

      // update file record with actual file info
      const contentType = item.contentType.startsWith('image/') ? 'image/webp' : item.contentType;
      return tx.file.update({
        where: { id },
        data: {
          isTemporary: false,
          isUploaded: true,
          fileSize: BigInt(buffer.byteLength),
          contentType: contentType,
        },
      });
    });
  }

  /**
   * Delete a file from S3 and delete the corresponding file record from the database.
   * @param {string} id The ID of the file record to delete
   * @returns {FilePayload} The deleted file record
   * @throws {NotFoundException} ErrorCode.FileNotFound
   */
  public async deleteFile(id: string): Promise<FilePayload> {
    return this.db.$transaction(async (tx) => {
      // find file record
      const item = await tx.file.findUnique({ where: { id } });
      if (!item) {
        throw new NotFoundException(ErrorCode.FileNotFound);
      }

      // delete file from S3
      await S3Service.deleteFile(item.bucket as S3Bucket, item.key);

      // delete file record from database
      return tx.file.delete({ where: { id } });
    });
  }

  /**
   * Cleanup expired temporary files. This function will find all temporary files that have passed their deleteAfter date. For each expired file, it will attempt to delete the file from S3 and then remove the corresponding database record.
   * @returns {void}
   */
  @Cron(CronExpression.EVERY_HOUR)
  public async cleanupTemporaryFiles() {
    return this.db.$transaction(async (tx) => {
      // find expired temporary files
      const now = new Date();
      const expiredFiles = await tx.file.findMany({
        where: {
          isTemporary: true,
          isUploaded: false,
          deleteAfter: { lte: now },
        },
      });

      let deletedCount = 0;
      for (const file of expiredFiles) {
        try {
          // delete file from S3
          await S3Service.deleteFile(file.bucket as S3Bucket, file.key);

          // delete DB record
          await tx.file.delete({ where: { id: file.id } });

          deletedCount++;
        } catch (err) {
          this.logger.error(`Failed to delete expired file from S3: ${file.id}`, err);
        }
      }

      this.logger.log(`Cleaned up ${deletedCount} expired temporary files`);
    });
  }

  /**
   * Get the sharp fit mode based on the provided ImageFit enum value. If no value is provided, it defaults to 'cover'.
   * @param {ImageFit} imageFit The ImageFit enum value to convert to sharp fit mode
   * @returns {keyof sharp.FitEnum} The corresponding sharp fit mode
   */
  private getFit(imageFit?: ImageFit): keyof sharp.FitEnum {
    switch (imageFit) {
      case ImageFit.COVER:
        return sharp.fit.cover;
      case ImageFit.CONTAIN:
        return sharp.fit.contain;
      case ImageFit.FILL:
        return sharp.fit.fill;
      case ImageFit.INSIDE:
        return sharp.fit.inside;
      case ImageFit.OUTSIDE:
        return sharp.fit.outside;
      default:
        return sharp.fit.cover;
    }
  }

  /**
   * Prepare the file buffer for upload. If the file is an image and resizing options are provided, it will resize and convert the image to webp format. Otherwise, it will return the original buffer.
   * @param {FilePayload} file The file payload
   * @param {Buffer} buffer The original file buffer
   * @returns {Buffer} The processed file buffer
   * @throws {InternalServerErrorException} ErrorCode.FileUploadProcessingError
   */
  private async prepareFileBuffer(file: FilePayload, buffer: Buffer): Promise<Buffer> {
    if (!file.contentType.startsWith('image/')) {
      return buffer;
    }

    try {
      const webpBuffer = await sharp(buffer)
        .resize({
          width: file.width,
          height: file.height,
          withoutEnlargement: true,
          fit: this.getFit(file.fit),
        })
        .webp({
          quality: file.quality ?? 90,
        })
        .toBuffer();

      return webpBuffer;
    } catch (err) {
      throw new InternalServerErrorException(ErrorCode.FileUploadProcessingError);
    }
  }
}
