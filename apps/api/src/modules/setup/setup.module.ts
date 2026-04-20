import { Module } from '@nestjs/common';

import { AuthModule } from '~/modules/auth/auth.module.js';
import { SetupController } from '~/modules/setup/setup.controller.js';
import { SetupService } from '~/modules/setup/setup.service.js';

@Module({
  imports: [AuthModule],
  controllers: [SetupController],
  providers: [SetupService]
})
export class SetupModule {}
