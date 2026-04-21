import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

type AuthTokensModel = {
  accessToken: string;
  refreshToken: string;
  email: string;
};

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
