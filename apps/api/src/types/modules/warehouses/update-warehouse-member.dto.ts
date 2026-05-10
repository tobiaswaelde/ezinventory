import { WarehouseUserRole } from '@/generated/prisma/enums';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateWarehouseMemberDTO {
  @ApiProperty({ enum: WarehouseUserRole, description: 'Role of the user in the warehouse' })
  @IsEnum(WarehouseUserRole)
  @IsOptional()
  role?: WarehouseUserRole;
}
