import { WarehouseUserRole } from '@/generated/prisma/enums';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiPropertyId } from '~/decorators/properties/api-property-id.decorator';

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
