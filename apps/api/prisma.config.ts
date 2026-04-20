import dotenv from 'dotenv';
import path from 'node:path';

import { env, type PrismaConfig } from 'prisma/config';

const rootEnvPath = path.resolve(process.cwd(), '.env');
const nestedApiEnvPath = path.resolve(process.cwd(), 'apps/api/.env');

dotenv.config({ path: rootEnvPath });
dotenv.config({ path: nestedApiEnvPath, override: true });

export default {
  schema: path.join('prisma'),
  migrations: {
    path: path.join('db', 'migrations')
  },
  datasource: {
    url: env('DATABASE_URL'),
    shadowDatabaseUrl: env('SHADOW_DATABASE_URL')
  }
} satisfies PrismaConfig;
