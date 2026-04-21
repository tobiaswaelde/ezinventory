import 'reflect-metadata';

import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import { validationPipe } from '~/config/validation.js';
import { LoginDto } from '~/modules/auth/dto/login.dto.js';

describe('validationPipe', () => {
  it('returns a consistent error payload for invalid dto input', async () => {
    const error = await validationPipe
      .transform(
        { email: 'invalid-email', password: 'short' },
        { type: 'body', metatype: LoginDto } as never
      )
      .catch((caught) => caught as BadRequestException);

    expect(error).toBeInstanceOf(BadRequestException);

    const response = error.getResponse() as {
      message: string;
      errors: Record<string, string[]>;
    };

    expect(response.message).toBe('Validation failed');
    expect(response.errors.email?.length).toBeGreaterThan(0);
    expect(response.errors.password?.length).toBeGreaterThan(0);
  });

  it('keeps forbidNonWhitelisted enabled with the same payload shape', async () => {
    const error = await validationPipe
      .transform(
        { email: 'user@example.com', password: '123456789012', unknownField: 'x' },
        { type: 'body', metatype: LoginDto } as never
      )
      .catch((caught) => caught as BadRequestException);

    expect(error).toBeInstanceOf(BadRequestException);

    const response = error.getResponse() as {
      message: string;
      errors: Record<string, string[]>;
    };

    expect(response.message).toBe('Validation failed');
    expect(response.errors.unknownField?.[0]).toContain('should not exist');
  });
});
