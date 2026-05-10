import { Module } from '@nestjs/common';
import { WarehousesController } from '~/modules/warehouses/warehouses.controller';
import { WarehousesService } from '~/modules/warehouses/warehouses.service';

@Module({
  providers: [{ provide: WarehousesService.token, useClass: WarehousesService }],
  controllers: [WarehousesController],
})
export class WarehousesModule {}
