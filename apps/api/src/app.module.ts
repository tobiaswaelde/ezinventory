import { Module } from '@nestjs/common';
import { GlobalModule } from '~/global.module';
import { AuthModule } from '~/modules/auth/auth.module';
import { HealthModule } from '~/modules/health/health.module';
import { InitModule } from '~/modules/init/init.module';
import { UsersModule } from '~/modules/users/users.module';
import { WarehousesModule } from '~/modules/warehouses/warehouses.module';
import { PrismaModule } from '~/prisma/prisma.module';

@Module({
  imports: [
    GlobalModule,
    PrismaModule,
    // system modules
    InitModule,
    HealthModule,
    // other modules
    AuthModule,
    UsersModule,
    WarehousesModule,
  ],
})
export class AppModule {}
