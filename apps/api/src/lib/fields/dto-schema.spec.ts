import { buildFieldSchemaFromDto, getDtoFields } from '~/lib/fields/dto-schema';
import { UserDTO } from '~/types/modules/user/user.dto';

jest.mock('~/services/s3.service', () => ({
  S3Service: {
    getFileUrl: jest.fn().mockResolvedValue(null),
  },
}));

describe('DTO schema utilities', () => {
  it('reads dto fields from swagger metadata', () => {
    const fields = getDtoFields(UserDTO);

    expect(fields).toContain('id');
    expect(fields).toContain('email');
    expect(fields).toContain('profile');
  });

  it('returns empty fields when swagger metadata is missing', () => {
    class NoMetadataDto {}
    expect(getDtoFields(NoMetadataDto)).toEqual([]);
  });

  it('builds nested relation schema from dto metadata', () => {
    const schema = buildFieldSchemaFromDto(UserDTO);

    expect(schema.id).toBe(true);
    expect(schema.profile).toEqual(
      expect.objectContaining({
        relation: true,
      }),
    );
  });

  it('covers fallback type resolution branches', () => {
    function throwingType() {
      throw new Error('boom');
    }

    class NestedDto {}
    Reflect.defineMetadata('swagger/apiModelPropertiesArray', [':id'], NestedDto.prototype);
    Reflect.defineMetadata(
      'swagger/apiModelProperties',
      { type: () => String },
      NestedDto.prototype,
      'id',
    );

    class BrokenTypeDto {}
    Reflect.defineMetadata(
      'swagger/apiModelPropertiesArray',
      [':broken', ':arr', ':fallback'],
      BrokenTypeDto.prototype,
    );
    Reflect.defineMetadata(
      'swagger/apiModelProperties',
      { type: throwingType },
      BrokenTypeDto.prototype,
      'broken',
    );
    Reflect.defineMetadata(
      'swagger/apiModelProperties',
      { type: [NestedDto] },
      BrokenTypeDto.prototype,
      'arr',
    );
    Reflect.defineMetadata('swagger/apiModelProperties', {}, BrokenTypeDto.prototype, 'fallback');
    Reflect.defineMetadata('design:type', NestedDto, BrokenTypeDto.prototype, 'fallback');

    const schema = buildFieldSchemaFromDto(BrokenTypeDto);

    expect(schema.broken).toBe(true);
    expect(schema.arr).toEqual(expect.objectContaining({ relation: true }));
    expect(schema.fallback).toEqual(expect.objectContaining({ relation: true }));
  });
});
