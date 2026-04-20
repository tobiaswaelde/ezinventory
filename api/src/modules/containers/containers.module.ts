import { Module } from '@nestjs/common';

import { ContainersController } from '~/modules/containers/containers.controller.js';
import { ContainersService } from '~/modules/containers/containers.service.js';

@Module({
  controllers: [ContainersController],
  providers: [ContainersService]
})
export class ContainersModule {}
