import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { TIMEZONES } from '~/config/meta/timezones';

export class UpdateUserPreferencesDTO {
  @ApiPropertyOptional()
  @IsString()
  @MaxLength(10)
  @IsOptional()
  language?: string;

  @ApiPropertyOptional({
    enum: TIMEZONES,
    description: 'Timezone of the user.',
    example: 'Europe/Berlin',
  })
  @IsEnum(TIMEZONES)
  @IsOptional()
  timezone?: string;
}
