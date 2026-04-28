import { Inject, Injectable } from '@nestjs/common';
import { PackageJsonService } from '~/services/package-json.service';
import { HealthStatus } from '~/types/modules/health/health-status';
import { HealthStatusDto } from '~/types/modules/health/health-status.dto';

@Injectable()
export class HealthService {
  public static readonly token = 'HEALTH_SERVICE';

  constructor(
    @Inject(PackageJsonService.token) private readonly packageJsonService: PackageJsonService,
  ) {}

  public getHealthStatus(): HealthStatusDto {
    const pjson = this.packageJsonService.getPackageJson();

    return new HealthStatusDto({
      name: pjson.name,
      version: pjson.version,
      status: HealthStatus.Online,
      description: pjson.description,
      author: pjson.author,
      uptime: process.uptime(),
    });
  }
}
