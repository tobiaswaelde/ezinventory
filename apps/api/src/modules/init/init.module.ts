import { Module } from '@nestjs/common';
import { InitService } from '~/modules/init/init.service';

@Module({
  providers: [{ provide: InitService.token, useClass: InitService }],
})
export class InitModule {}
