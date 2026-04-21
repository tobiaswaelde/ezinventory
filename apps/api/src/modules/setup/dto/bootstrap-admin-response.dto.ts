import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class BootstrapAdminResponseDto {
  @Expose()
  @ApiProperty({ example: true })
  setupInitialized!: true;

  @Expose()
  @ApiProperty({ format: 'uuid' })
  adminUserId!: string;

  @Expose()
  @ApiProperty()
  email!: string;

  constructor(partial: Partial<BootstrapAdminResponseDto>) {
    Object.assign(this, partial);
  }

  static fromModel(model: {
    setupInitialized: true;
    adminUserId: string;
    email: string;
  }): BootstrapAdminResponseDto {
    return new BootstrapAdminResponseDto(model);
  }
}
