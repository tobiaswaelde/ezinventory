import { Module } from '@nestjs/common';

import { MediaController } from '~/modules/media/media.controller.js';
import { MediaService } from '~/modules/media/media.service.js';

@Module({
  controllers: [MediaController],
  providers: [MediaService]
})
export class MediaModule {}
