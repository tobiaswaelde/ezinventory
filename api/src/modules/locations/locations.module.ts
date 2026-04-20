import { Module } from '@nestjs/common';

import { LocationsController } from '~/modules/locations/locations.controller.js';
import { LocationsService } from '~/modules/locations/locations.service.js';

@Module({
  controllers: [LocationsController],
  providers: [LocationsService]
})
export class LocationsModule {}
