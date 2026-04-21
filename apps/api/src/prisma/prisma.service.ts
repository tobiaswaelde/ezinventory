import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import prismaClient from '@prisma/client';
import { Pool } from 'pg';

import { ENV } from '~/config/env.js';

const { PrismaClient } = prismaClient as typeof import('@prisma/client');

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const pool = new Pool({ connectionString: ENV.DATABASE_URL });
    const adapter = new PrismaPg(pool);

    super({ adapter });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
