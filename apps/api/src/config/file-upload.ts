import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { ErrorCode } from '~/types/error-code';

const AVATAR_FILE_SIZE_LIMIT = 2 * 1024 * 1024; // 2MB
const TEMP_FILE_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB

/**
 * Multer options for avatar file uploads.
 * Limits file size to 2MB and only allows image files.
 * @throws {BadRequestException} ErrorCode.FileUploadInvalidFileType
 */
export const uploadAvatarOptions: MulterOptions = {
  limits: { files: 1, fileSize: AVATAR_FILE_SIZE_LIMIT },
  fileFilter(req, file, callback) {
    if (!file.mimetype.startsWith('image/')) {
      callback(
        new BadRequestException(
          ErrorCode.FileUploadInvalidFileType,
          'Only image files are allowed.',
        ),
        false,
      );
    }
    callback(null, true);
  },
};

/**
 * Multer options for temporary file uploads.
 * Limits file size to 5MB and only allows image and PDF files.
 * @throws {BadRequestException} ErrorCode.FileUploadInvalidFileType
 */
export const uploadTempFileOptions: MulterOptions = {
  limits: { files: 1, fileSize: TEMP_FILE_SIZE_LIMIT },
  fileFilter(req, file, callback) {
    const isImage = file.mimetype.match(/^image\/(png|jpeg|jpg|gif)$/i);
    const isPdf = file.mimetype === 'application/pdf';

    if (!isImage && !isPdf) {
      callback(
        new BadRequestException(
          ErrorCode.FileUploadInvalidFileType,
          'Only image and PDF files are allowed.',
        ),
        false,
      );
    }
    callback(null, true);
  },
};
