import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';

export class UpdatePreferredLanguageDto {
  @ApiProperty({ enum: ['de', 'en'], example: 'de' })
  @IsString()
  @IsIn(['de', 'en'])
  preferredLanguage!: 'de' | 'en';
}
