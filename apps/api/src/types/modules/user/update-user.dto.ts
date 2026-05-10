import { UserRole } from '@/generated/prisma/enums';
import { ApiPropertyOptional } from '@nestjs/swagger/dist/decorators/api-property.decorator';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateUserDTO {
  @ApiPropertyOptional({ enum: UserRole })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
