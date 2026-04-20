import { existsSync } from 'node:fs';
import path from 'node:path';

import dotenv from 'dotenv';
import { cleanEnv, port, str } from 'envalid';

const rootEnvPath = path.resolve(process.cwd(), '.env');
const nestedApiEnvPath = path.resolve(process.cwd(), 'apps/api/.env');

if (existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
}

if (existsSync(nestedApiEnvPath)) {
  dotenv.config({ path: nestedApiEnvPath, override: true });
}

export const ENV = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'production', 'test'], default: 'development' }),
  PORT: port({ default: 3001 }),
  DATABASE_URL: str({ desc: 'Database connection URL' }),
  SHADOW_DATABASE_URL: str({ desc: 'Shadow database URL for Prisma migrations' }),
  AUTH_ACCESS_TOKEN_SECRET: str({ default: 'change-me-access-secret' }),
  AUTH_REFRESH_TOKEN_SECRET: str({ default: 'change-me-refresh-secret' }),
  AUTH_ACCESS_TOKEN_TTL: str({ default: '15m' }),
  AUTH_REFRESH_TOKEN_TTL: str({ default: '30d' }),
  AUTH_PASSKEY_RP_ID: str({ default: 'localhost' }),
  AUTH_PASSKEY_RP_NAME: str({ default: 'EZ Inventory' }),
  AUTH_PASSKEY_ORIGIN: str({ default: 'http://localhost:3000' })
});
