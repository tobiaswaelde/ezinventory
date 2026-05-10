import { Module } from '@nestjs/common';
import { WarehouseMembersController } from '~/modules/warehouses/members/warehouse-members.controller';
import { WarehouseMembersService } from '~/modules/warehouses/members/warehouse-members.service';
import { WarehousesController } from '~/modules/warehouses/warehouses.controller';
import { WarehousesService } from '~/modules/warehouses/warehouses.service';

@Module({
  providers: [
    { provide: WarehousesService.token, useClass: WarehousesService },
    { provide: WarehouseMembersService.token, useClass: WarehouseMembersService },
  ],
  controllers: [WarehousesController, WarehouseMembersController],
})
export class WarehousesModule {}
