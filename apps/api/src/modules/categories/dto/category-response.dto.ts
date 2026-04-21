import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export type CategoryResponseModel = {
  id: string;
  name: string;
  description: string | null;
};

export class CategoryResponseDto {
  @Expose()
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @Expose()
  @ApiProperty()
  name!: string;

  @Expose()
  @ApiProperty({ nullable: true })
  description!: string | null;

  constructor(partial: Partial<CategoryResponseDto>) {
    Object.assign(this, partial);
  }

  static fromModel(model: CategoryResponseModel): CategoryResponseDto {
    return new CategoryResponseDto(model);
  }

  static fromModels(models: CategoryResponseModel[]): CategoryResponseDto[] {
    return models.map((model) => CategoryResponseDto.fromModel(model));
  }
}
