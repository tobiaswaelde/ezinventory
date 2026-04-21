import { Module } from '@nestjs/common';

import { AuthModule } from '~/modules/auth/auth.module.js';
import { MediaController } from '~/modules/media/media.controller.js';
import { MediaService } from '~/modules/media/media.service.js';

@Module({
  imports: [AuthModule],
  controllers: [MediaController],
  providers: [MediaService]
})
export class MediaModule {}
