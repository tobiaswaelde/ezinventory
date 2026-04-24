import { Module } from '@nestjs/common';
import { AuthModule } from '~/modules/auth/auth.module';
import { HealthModule } from '~/modules/health/health.module';
import { InitModule } from '~/modules/init/init.module';
import { UsersModule } from '~/modules/users/users.module';
import { PrismaModule } from '~/prisma/prisma.module';

@Module({
  imports: [PrismaModule, InitModule, HealthModule, AuthModule, UsersModule],
})
export class AppModule {}
