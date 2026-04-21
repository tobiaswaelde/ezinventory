import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import type { AuthenticatedUser } from '~/modules/auth/types/authenticated-user.type.js';

export class AuthenticatedUserDto {
  @Expose()
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @Expose()
  @ApiProperty()
  email!: string;

  @Expose()
  @ApiProperty()
  role!: string;

  @Expose()
  @ApiProperty({ enum: ['de', 'en'] })
  preferredLanguage!: string;

  constructor(partial: Partial<AuthenticatedUserDto>) {
    Object.assign(this, partial);
  }

  static fromModel(model: AuthenticatedUser): AuthenticatedUserDto {
    return new AuthenticatedUserDto(model);
  }
}
