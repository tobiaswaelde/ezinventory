import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ENV } from '~/config/env';
import { PrismaService } from '~/prisma/prisma.service';
import { CryptoUtil } from '~/util/crypto';

const logger = new Logger('INIT');

@Injectable()
export class InitService implements OnModuleInit {
  public static readonly token = 'INIT_SERVICE';

  constructor(private readonly db: PrismaService) {}

  async onModuleInit() {
    const start = performance.now();

    await this.migrate();

    logger.log('Begin initialization...');
    //
    await this.createInitialAdminUser();

    const durationMs = performance.now().valueOf() - start.valueOf();
    logger.log(`Initialization completed in ${durationMs}ms`);
  }

  /**
   * Create initial admin user with the provided role and branch. The user's email and password are taken from environment variables.
   */
  public async createInitialAdminUser() {
    await this.db.$transaction(async (tx) => {
      const password = await CryptoUtil.encryptPassword(ENV.INIT_ADMIN_PASSWORD);
      await tx.user.upsert({
        where: { email: ENV.INIT_ADMIN_EMAIL },
        create: {
          email: ENV.INIT_ADMIN_EMAIL,
          password: password,
          profile: {
            create: {
              firstname: 'Admin',
              lastname: 'Admin',
            },
          },
          preferences: {
            create: {},
          },
        },
        update: {},
      });
    });
  }

  /**
   * Perform necessary database migrations or data transformations during initialization.
   */
  private async migrate() {
    logger.log('Starting database migrations...');
    await this.db.$transaction(async (tx) => {
      /**
       * Migrate websocket tokens for users. This is necessary to ensure that all existing users have a valid token for authenticating with the WebsocketService. The migration looks for any users with a null or default token value and generates a new secure token for them. This should only be needed once during the initial deployment of the WebsocketService, and can be removed in future versions once all users have been migrated.
       */
      const migrateWebsocketTokens = async () => {
        logger.log('Migrating websocket tokens for users...');
        // fix websocketToken for users that have it set to null (should not happen, but just in case)
        const users = await tx.user.findMany({
          where: { websocketToken: '00000000' },
          select: { id: true },
        });
        for (const user of users) {
          logger.debug(`Migrating websocket token for user ${user.id}...`);
          const newToken = CryptoUtil.generateSecureToken(256);
          await tx.user.update({ where: { id: user.id }, data: { websocketToken: newToken } });
        }
        logger.log('Websocket token migration completed.');
      };

      await migrateWebsocketTokens();
    });
    logger.log('Database migrations completed.');
  }
}
