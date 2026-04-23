import dotenv from 'dotenv';
import path from 'node:path';
import { env, type PrismaConfig } from 'prisma/config';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export default {
  schema: path.join('prisma'),
  migrations: {
    path: path.join('db', 'migrations'),
  },
  datasource: {
    url: env('DATABASE_URL'),
    shadowDatabaseUrl: env('SHADOW_DATABASE_URL'),
  },
} satisfies PrismaConfig;
