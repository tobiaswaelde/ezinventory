import { Module } from '@nestjs/common';

import { AuthModule } from '~/modules/auth/auth.module.js';
import { ContainersController } from '~/modules/containers/containers.controller.js';
import { ContainersService } from '~/modules/containers/containers.service.js';

@Module({
  imports: [AuthModule],
  controllers: [ContainersController],
  providers: [ContainersService]
})
export class ContainersModule {}
