import { Module } from '@nestjs/common';
import { HealthController } from '~/modules/health/health.controller';
import { HealthService } from '~/modules/health/health.service';
import { PackageJsonService } from '~/services/package-json.service';

@Module({
  providers: [
    { provide: HealthService.token, useClass: HealthService },
    { provide: PackageJsonService.token, useClass: PackageJsonService },
  ],
  controllers: [HealthController],
})
export class HealthModule {}
