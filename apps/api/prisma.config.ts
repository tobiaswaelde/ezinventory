import dotenv from 'dotenv';
import path from 'node:path';
import { type PrismaConfig } from 'prisma/config';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const DEFAULT_DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/ezinventory?schema=public';
const DEFAULT_SHADOW_DATABASE_URL =
  'postgresql://postgres:postgres@localhost:5432/ezinventory?schema=prisma';

export default {
  schema: path.join('prisma'),
  migrations: {
    path: path.join('db', 'migrations'),
  },
  datasource: {
    url: process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL,
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL ?? DEFAULT_SHADOW_DATABASE_URL,
  },
} satisfies PrismaConfig;
