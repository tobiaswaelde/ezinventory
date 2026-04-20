import { Module } from '@nestjs/common';

import { AuthModule } from '~/modules/auth/auth.module.js';
import { LocationsController } from '~/modules/locations/locations.controller.js';
import { LocationsService } from '~/modules/locations/locations.service.js';

@Module({
  imports: [AuthModule],
  controllers: [LocationsController],
  providers: [LocationsService]
})
export class LocationsModule {}
