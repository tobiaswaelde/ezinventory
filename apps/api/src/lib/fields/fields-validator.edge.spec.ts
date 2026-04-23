import { BadRequestException } from '@nestjs/common';
import { FieldsValidator } from '~/lib/fields/fields-validator';
import { relation } from '~/lib/fields/types';

describe('FieldsValidator edge cases', () => {
  const nestedSchema = {
    profile: relation({
      id: true,
      organization: relation({
        id: true,
      }),
    }),
  };

  it('accepts non-nested projection in validateNoNestedSelection', () => {
    expect(() =>
      FieldsValidator.validateNoNestedSelection({ id: true, email: true }),
    ).not.toThrow();
  });

  it('requires explicit nested include when relation include is true', () => {
    expect(() =>
      FieldsValidator.validateIncludeRequirements(
        {
          profile: {
            organization: {
              id: true,
            },
          },
        },
        nestedSchema,
        { profile: true },
      ),
    ).toThrow(BadRequestException);
  });

  it('accepts nested include context via include object', () => {
    expect(() =>
      FieldsValidator.validateIncludeRequirements(
        {
          profile: {
            organization: {
              id: true,
            },
          },
        },
        nestedSchema,
        {
          profile: {
            include: {
              organization: true,
            },
          },
        },
      ),
    ).not.toThrow();
  });

  it('rejects nested relation selection when include child is non-object', () => {
    expect(() =>
      FieldsValidator.validateIncludeRequirements(
        {
          profile: {
            organization: {
              id: true,
            },
          },
        },
        nestedSchema,
        {
          profile: 1,
        },
      ),
    ).toThrow(BadRequestException);
  });

  it('rejects nested relation selection when include child lacks nested relation include', () => {
    expect(() =>
      FieldsValidator.validateIncludeRequirements(
        {
          profile: {
            organization: {
              id: true,
            },
          },
        },
        nestedSchema,
        {
          profile: {
            foo: 'bar',
          },
        },
      ),
    ).toThrow(BadRequestException);
  });
});
