import { existsSync } from 'node:fs';
import path from 'node:path';

import dotenv from 'dotenv';
import { cleanEnv, port, str } from 'envalid';

const rootEnvPath = path.resolve(process.cwd(), '.env');
const nestedApiEnvPath = path.resolve(process.cwd(), 'api/.env');

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
  SHADOW_DATABASE_URL: str({ desc: 'Shadow database URL for Prisma migrations' })
});
