import { BadRequestException, ValidationPipe } from '@nestjs/common';
import type { ValidationError } from 'class-validator';

type ValidationErrorMap = Record<string, string[]>;

function collectValidationErrors(errors: ValidationError[], parentPath = ''): ValidationErrorMap {
  const map: ValidationErrorMap = {};

  for (const error of errors) {
    const path = parentPath ? `${parentPath}.${error.property}` : error.property;

    if (error.constraints) {
      map[path] = Object.values(error.constraints);
    }

    if (error.children && error.children.length > 0) {
      Object.assign(map, collectValidationErrors(error.children, path));
    }
  }

  return map;
}

export const validationPipe = new ValidationPipe({
  whitelist: true,
  transform: true,
  forbidNonWhitelisted: true,
  transformOptions: { enableImplicitConversion: true },
  validationError: {
    target: false,
    value: false
  },
  exceptionFactory: (errors: ValidationError[]) =>
    new BadRequestException({
      message: 'Validation failed',
      errors: collectValidationErrors(errors)
    })
});
