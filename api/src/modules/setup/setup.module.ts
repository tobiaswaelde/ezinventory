import { Module } from '@nestjs/common';

import { SetupController } from '~/modules/setup/setup.controller.js';
import { SetupService } from '~/modules/setup/setup.service.js';

@Module({
  controllers: [SetupController],
  providers: [SetupService]
})
export class SetupModule {}
