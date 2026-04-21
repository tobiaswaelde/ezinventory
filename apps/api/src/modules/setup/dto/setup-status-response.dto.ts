import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { RegistrationMode } from '~/modules/setup/dto/update-registration-mode.dto.js';

export class SetupStatusResponseDto {
  @Expose()
  @ApiProperty({ example: true })
  setupInitialized!: boolean;

  @Expose()
  @ApiProperty({ enum: RegistrationMode })
  registrationMode!: RegistrationMode;

  constructor(partial: Partial<SetupStatusResponseDto>) {
    Object.assign(this, partial);
  }

  static fromModel(model: {
    setupInitialized: boolean;
    registrationMode: RegistrationMode;
  }): SetupStatusResponseDto {
    return new SetupStatusResponseDto(model);
  }
}
