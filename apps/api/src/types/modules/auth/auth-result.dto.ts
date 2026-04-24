import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { UserDTO } from '~/types/modules/user/user.dto';

export class AuthResultDTO {
  @Expose()
  @ApiPropertyOptional({ description: 'undefined if MFA is pending' })
  user: UserDTO;

  @Expose()
  @ApiProperty({ description: 'JWT token for authentication', example: '<JWT_TOKEN>' })
  token: string;

  @Expose()
  @ApiProperty({ description: 'Indicates if MFA is pending', example: false })
  mfaPending: boolean;

  constructor(partial: Partial<AuthResultDTO>) {
    Object.assign(this, partial);
  }
}
