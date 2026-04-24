import { Logger } from '@nestjs/common';
import dotenv from 'dotenv';
import { cleanEnv, num, str } from 'envalid';
import path from 'node:path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const ENV = cleanEnv(process.env, {
  //#region app
  NODE_ENV: str({ choices: ['development', 'production', 'test'] }),
  PORT: num({ default: 3001 }),
  CORS_ORIGIN: str({ devDefault: '*', desc: 'The allowed CORS origin' }),
  API_BASE_URL: str({ devDefault: 'http://localhost:3001' }),
  APP_BASE_URL: str({ devDefault: 'http://localhost:3000' }),
  //#endregion
  //#region database
  DATABASE_URL: str({ desc: 'Database connection URL' }),
  SHADOW_DATABASE_URL: str({ desc: 'Shadow Database connection URL (for Prisma migrations)' }),
  //#endregion
  //#region S3
  S3_ENDPOINT: str({}),
  S3_ACCESS_KEY_ID: str({}),
  S3_SECRET_KEY: str({}),
  //#endregion
  //#region auth
  AUTH_JWT_ISSUER: str({ devDefault: 'crm-tenant-api-test' }),
  AUTH_JWT_SECRET: str({
    devDefault: '00000000000000000000000000000000',
    desc: '256-bit secret key',
  }),
  AUTH_JWT_EXPIRATION: str({
    default: '7d',
    desc: 'JWT expiration time. expressed in seconds or a string describing a time span zeit/ms. Eg: 60, "2 days", "10h", "7d"',
  }),
  AUTH_BCRYPT_ROUNDS: num({ default: 12 }),
  //#endregion
  //#region init
  INIT_ADMIN_EMAIL: str({ desc: 'Initial admin user email' }),
  INIT_ADMIN_PASSWORD: str({ desc: 'Initial admin user password' }),
  //#endregion
});

// log environment variables to console if app was started in dev mode
if (ENV.isDev) {
  const logger = new Logger('ENV');
  // console.log('ENVIRONMENT VARIABLES:');
  for (const key of Object.keys(ENV)) {
    // logger.log(key, '=', ENV[key]);
    logger.debug(`${key} = ${ENV[key]}`);
  }
}
