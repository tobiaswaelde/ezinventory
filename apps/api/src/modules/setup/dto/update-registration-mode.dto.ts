import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum RegistrationMode {
  OPEN = 'OPEN',
  ADMIN_ONLY = 'ADMIN_ONLY'
}

export class UpdateRegistrationModeDto {
  @ApiProperty({ enum: RegistrationMode, example: RegistrationMode.ADMIN_ONLY })
  @IsEnum(RegistrationMode)
  mode!: RegistrationMode;
}
