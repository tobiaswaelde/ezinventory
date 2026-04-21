import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import type { UserRole as UserRoleType } from '@prisma/client';

export class UpdateUserRoleResponseDto {
  @Expose()
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @Expose()
  @ApiProperty()
  role!: UserRoleType;

  constructor(partial: Partial<UpdateUserRoleResponseDto>) {
    Object.assign(this, partial);
  }

  static fromModel(model: {
    id: string;
    role: UserRoleType;
  }): UpdateUserRoleResponseDto {
    return new UpdateUserRoleResponseDto(model);
  }
}
