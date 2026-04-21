import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import type { UserRole as UserRoleType } from '@prisma/client';

export class AdminUserResponseDto {
  @Expose()
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @Expose()
  @ApiProperty()
  email!: string;

  @Expose()
  @ApiProperty()
  role!: UserRoleType;

  constructor(partial: Partial<AdminUserResponseDto>) {
    Object.assign(this, partial);
  }

  static fromModel(model: {
    id: string;
    email: string;
    role: UserRoleType;
  }): AdminUserResponseDto {
    return new AdminUserResponseDto(model);
  }
}
