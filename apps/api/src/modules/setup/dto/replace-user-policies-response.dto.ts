import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ReplaceUserPoliciesResponseDto {
  @Expose()
  @ApiProperty({ format: 'uuid' })
  userId!: string;

  @Expose()
  @ApiProperty({ type: [String] })
  policyIds!: string[];

  constructor(partial: Partial<ReplaceUserPoliciesResponseDto>) {
    Object.assign(this, partial);
  }

  static fromModel(model: {
    userId: string;
    policyIds: string[];
  }): ReplaceUserPoliciesResponseDto {
    return new ReplaceUserPoliciesResponseDto(model);
  }
}
