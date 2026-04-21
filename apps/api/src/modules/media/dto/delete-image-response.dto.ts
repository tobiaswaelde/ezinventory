import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class DeleteImageResponseDto {
  @Expose()
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @Expose()
  @ApiProperty({ example: true })
  deleted!: true;

  constructor(partial: Partial<DeleteImageResponseDto>) {
    Object.assign(this, partial);
  }

  static fromModel(model: { id: string; deleted: true }): DeleteImageResponseDto {
    return new DeleteImageResponseDto(model);
  }
}
