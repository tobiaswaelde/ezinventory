import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import type { AuthenticatedUser } from '~/modules/auth/types/authenticated-user.type.js';

type AuthTokensModel = {
  accessToken: string;
  refreshToken: string;
  email: string;
};

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

export class UpdatePreferredLanguageResponseDto {
  @Expose()
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @Expose()
  @ApiProperty({ enum: ['de', 'en'] })
  preferredLanguage!: 'de' | 'en';

  constructor(partial: Partial<UpdatePreferredLanguageResponseDto>) {
    Object.assign(this, partial);
  }

  static fromModel(model: { id: string; preferredLanguage: 'de' | 'en' }): UpdatePreferredLanguageResponseDto {
    return new UpdatePreferredLanguageResponseDto(model);
  }
}

export class AuthTokensResponseDto {
  @Expose()
  @ApiProperty()
  accessToken!: string;

  @Expose()
  @ApiProperty()
  refreshToken!: string;

  @Expose()
  @ApiProperty()
  email!: string;

  constructor(partial: Partial<AuthTokensResponseDto>) {
    Object.assign(this, partial);
  }

  static fromModel(model: AuthTokensModel): AuthTokensResponseDto {
    return new AuthTokensResponseDto(model);
  }
}

export class PasskeyOptionsResponseDto {
  @Expose()
  @ApiProperty()
  challenge!: string;

  @Expose()
  @ApiProperty({ type: 'object', additionalProperties: true })
  options!: Record<string, unknown>;

  @Expose()
  @ApiProperty()
  email!: string;

  constructor(partial: Partial<PasskeyOptionsResponseDto>) {
    Object.assign(this, partial);
  }

  static fromModel(model: { challenge: string; options: Record<string, unknown>; email: string }): PasskeyOptionsResponseDto {
    return new PasskeyOptionsResponseDto(model);
  }
}

export class PasskeyRegisterVerifyResponseDto {
  @Expose()
  @ApiProperty({ example: true })
  verified!: true;

  @Expose()
  @ApiProperty()
  credentialId!: string;

  @Expose()
  @ApiProperty()
  email!: string;

  constructor(partial: Partial<PasskeyRegisterVerifyResponseDto>) {
    Object.assign(this, partial);
  }

  static fromModel(model: { verified: true; credentialId: string; email: string }): PasskeyRegisterVerifyResponseDto {
    return new PasskeyRegisterVerifyResponseDto(model);
  }
}

export class PasskeyListItemResponseDto {
  @Expose()
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @Expose()
  @ApiProperty({ nullable: true })
  deviceName!: string | null;

  @Expose()
  @ApiProperty({ format: 'date-time' })
  createdAt!: Date;

  @Expose()
  @ApiProperty({ format: 'date-time', nullable: true })
  lastUsedAt!: Date | null;

  constructor(partial: Partial<PasskeyListItemResponseDto>) {
    Object.assign(this, partial);
  }

  static fromModel(model: { id: string; deviceName: string | null; createdAt: Date; lastUsedAt: Date | null }): PasskeyListItemResponseDto {
    return new PasskeyListItemResponseDto(model);
  }

  static fromModels(models: Array<{ id: string; deviceName: string | null; createdAt: Date; lastUsedAt: Date | null }>): PasskeyListItemResponseDto[] {
    return models.map((model) => PasskeyListItemResponseDto.fromModel(model));
  }
}

export class DeletePasskeyResponseDto {
  @Expose()
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @Expose()
  @ApiProperty({ example: true })
  deleted!: true;

  constructor(partial: Partial<DeletePasskeyResponseDto>) {
    Object.assign(this, partial);
  }

  static fromModel(model: { id: string; deleted: true }): DeletePasskeyResponseDto {
    return new DeletePasskeyResponseDto(model);
  }
}

export class LogoutResponseDto {
  @Expose()
  @ApiProperty({ example: true })
  loggedOut!: true;

  constructor(partial: Partial<LogoutResponseDto>) {
    Object.assign(this, partial);
  }

  static fromModel(model: { loggedOut: true }): LogoutResponseDto {
    return new LogoutResponseDto(model);
  }
}
