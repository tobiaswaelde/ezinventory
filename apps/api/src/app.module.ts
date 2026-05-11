import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { GlobalModule } from '~/global.module';
import { AuthModule } from '~/modules/auth/auth.module';
import { FilesModule } from '~/modules/files/files.module';
import { HealthModule } from '~/modules/health/health.module';
import { InitModule } from '~/modules/init/init.module';
import { UsersModule } from '~/modules/users/users.module';
import { WarehousesModule } from '~/modules/warehouses/warehouses.module';
import { PrismaModule } from '~/prisma/prisma.module';

@Module({
  imports: [
    GlobalModule,
    ScheduleModule.forRoot(),
    PrismaModule,
    // system modules
    InitModule,
    HealthModule,
    // other modules
    AuthModule,
    UsersModule,
    FilesModule,
    WarehousesModule,
  ],
})
export class AppModule {}
