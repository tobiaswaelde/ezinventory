import { Module } from '@nestjs/common';
import { FilesController } from '~/modules/files/files.controller';
import { FilesService } from '~/modules/files/files.service';

@Module({
  providers: [{ provide: FilesService.token, useClass: FilesService }],
  controllers: [FilesController],
})
export class FilesModule {}
