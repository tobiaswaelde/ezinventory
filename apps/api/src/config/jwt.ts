import { JwtModuleAsyncOptions, JwtVerifyOptions } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import { ENV } from '~/config/env';

function getExpirationTime(): StringValue | number {
  const value = Number(ENV.AUTH_JWT_EXPIRATION);
  return isNaN(value) ? (ENV.AUTH_JWT_EXPIRATION as StringValue) : value;
}

export const jwtOptions: JwtModuleAsyncOptions = {
  global: true,
  useFactory: () => ({
    secret: ENV.AUTH_JWT_SECRET,
    signOptions: {
      issuer: ENV.AUTH_JWT_ISSUER,
      expiresIn: getExpirationTime(),
    },
  }),
};

export const jwtVerifyOptions: JwtVerifyOptions = {
  issuer: ENV.AUTH_JWT_ISSUER,
  secret: ENV.AUTH_JWT_SECRET,
};
