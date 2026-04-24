import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { TIMEZONES } from '~/config/meta/timezones';

export class CreateUserPreferencesDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  language: string;

  @ApiPropertyOptional({
    enum: TIMEZONES,
    description: 'Timezone of the user. Will be inferred from the branch if left empty.',
    example: 'Europe/Berlin',
  })
  @IsEnum(TIMEZONES)
  @IsOptional()
  timezone?: string;
}
