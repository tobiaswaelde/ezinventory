import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

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
