import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

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

  static fromModel(model: {
    id: string;
    preferredLanguage: 'de' | 'en';
  }): UpdatePreferredLanguageResponseDto {
    return new UpdatePreferredLanguageResponseDto(model);
  }
}
