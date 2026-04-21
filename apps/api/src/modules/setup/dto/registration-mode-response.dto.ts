import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { RegistrationMode } from '~/modules/setup/dto/update-registration-mode.dto.js';

export class RegistrationModeResponseDto {
  @Expose()
  @ApiProperty({ enum: RegistrationMode })
  mode!: RegistrationMode;

  constructor(partial: Partial<RegistrationModeResponseDto>) {
    Object.assign(this, partial);
  }

  static fromModel(model: { mode: RegistrationMode }): RegistrationModeResponseDto {
    return new RegistrationModeResponseDto(model);
  }
}
