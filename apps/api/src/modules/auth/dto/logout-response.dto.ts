import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

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
