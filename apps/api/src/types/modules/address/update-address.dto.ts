import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';
import Holidays from 'date-holidays';
import { IsGeoCode } from '~/validators/is-geo-code.validator';

const hd = new Holidays();

export class UpdateAddressDTO {
  @ApiPropertyOptional({ example: 'Musterstraße 123' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  street?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(255)
  apartment?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(255)
  city?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(20)
  zip?: string;

  @ApiPropertyOptional({
    maxLength: 2,
    example: 'DE',
    description: 'ISO 3166-2 country code',
    enum: Object.keys(hd.getCountries()),
  })
  @IsString()
  @IsOptional()
  @MaxLength(2)
  @IsIn(Object.keys(hd.getCountries()))
  countryCode?: string;

  @ApiPropertyOptional({ maxLength: 2, example: 'SL' })
  @IsString()
  @IsOptional()
  @ValidateIf((o) => o.countryCode !== undefined)
  @IsGeoCode()
  stateCode?: string = null;

  @ApiPropertyOptional({ maxLength: 5, example: 'A' })
  @IsString()
  @IsOptional()
  @ValidateIf((o) => o.stateCode !== undefined)
  @IsGeoCode()
  regionCode?: string = null;
}
