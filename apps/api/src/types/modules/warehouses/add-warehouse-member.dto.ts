import { WarehouseUserRole } from '@/generated/prisma/enums';
import { ApiProperty } from '@nestjs/swagger';
import { ApiPropertyId } from '@querry-kit/nest';
import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class AddWarehouseMemberDTO {
  @ApiPropertyId()
  @IsString()
  @IsUUID(4)
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ enum: WarehouseUserRole, description: 'Role of the user in the warehouse' })
  @IsEnum(WarehouseUserRole)
  @IsNotEmpty()
  role: WarehouseUserRole;
}
