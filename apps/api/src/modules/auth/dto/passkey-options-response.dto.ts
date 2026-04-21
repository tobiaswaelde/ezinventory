import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

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

  static fromModel(model: {
    challenge: string;
    options: Record<string, unknown>;
    email: string;
  }): PasskeyOptionsResponseDto {
    return new PasskeyOptionsResponseDto(model);
  }
}
