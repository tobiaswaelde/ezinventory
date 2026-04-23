import { Prisma } from '@/generated/prisma/client';
import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const mapped = this.mapError(exception);

    response.status(mapped.status).json({
      statusCode: mapped.status,
      error: mapped.error,
      message: mapped.message,
      code: exception.code,
    });
  }

  private mapError(exception: Prisma.PrismaClientKnownRequestError): {
    status: number;
    error: string;
    message: string;
  } {
    switch (exception.code) {
      case 'P2002':
        return {
          status: HttpStatus.CONFLICT,
          error: 'Unique constraint failed',
          message: `Duplicate value for field(s): ${(exception.meta?.target as string[])?.join(', ')}`,
        };

      case 'P2025':
        return {
          status: HttpStatus.NOT_FOUND,
          error: 'Record not found',
          message: 'The requested resource does not exist',
        };

      default:
        return {
          status: HttpStatus.BAD_REQUEST,
          error: 'Database error',
          message: exception.message,
        };
    }
  }
}
