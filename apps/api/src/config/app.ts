import { Logger } from '@nestjs/common';
import { NestApplicationOptions } from '@nestjs/common/interfaces/nest-application-options.interface';

export const appLogger = new Logger('APP');

export const appOptions: NestApplicationOptions = {
  bufferLogs: true,
  logger: appLogger,
};
