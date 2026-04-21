import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

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

  static fromModel(model: {
    id: string;
    deviceName: string | null;
    createdAt: Date;
    lastUsedAt: Date | null;
  }): PasskeyListItemResponseDto {
    return new PasskeyListItemResponseDto(model);
  }

  static fromModels(
    models: Array<{
      id: string;
      deviceName: string | null;
      createdAt: Date;
      lastUsedAt: Date | null;
    }>
  ): PasskeyListItemResponseDto[] {
    return models.map((model) => PasskeyListItemResponseDto.fromModel(model));
  }
}
