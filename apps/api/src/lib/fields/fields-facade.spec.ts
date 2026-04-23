import { Fields } from '~/lib/fields/fields';
import { FieldsParser } from '~/lib/fields/fields-parser';
import { FieldsProjector } from '~/lib/fields/fields-projector';
import { FieldsValidator } from '~/lib/fields/fields-validator';
import { FieldSchema, relation } from '~/lib/fields/types';

describe('Fields facade', () => {
  const schema: FieldSchema = {
    id: true,
    profile: relation({ id: true }),
  };

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('returns undefined when parser yields no projection', () => {
    jest.spyOn(FieldsParser, 'parse').mockReturnValue(undefined);
    const validateSpy = jest.spyOn(FieldsValidator, 'validateProjection');

    const result = Fields.parseAndValidate(undefined, schema);

    expect(result).toBeUndefined();
    expect(validateSpy).not.toHaveBeenCalled();
  });

  it('validates projection and optional include/nested rules', () => {
    const projection = { profile: { id: true } };

    jest.spyOn(FieldsParser, 'parse').mockReturnValue(projection as never);
    const validateProjectionSpy = jest
      .spyOn(FieldsValidator, 'validateProjection')
      .mockReturnValue();
    const validateNoNestedSpy = jest
      .spyOn(FieldsValidator, 'validateNoNestedSelection')
      .mockReturnValue();
    const validateIncludeSpy = jest
      .spyOn(FieldsValidator, 'validateIncludeRequirements')
      .mockReturnValue();

    const result = Fields.parseAndValidate('profile{id}', schema, {
      allowNested: false,
      include: { profile: true },
      requireIncludeForRelations: true,
    });

    expect(validateProjectionSpy).toHaveBeenCalledWith(projection, schema);
    expect(validateNoNestedSpy).toHaveBeenCalledWith(projection);
    expect(validateIncludeSpy).toHaveBeenCalledWith(projection, schema, { profile: true });
    expect(result).toEqual(projection);
  });

  it('does not invoke optional nested/include validators when options are disabled', () => {
    const projection = { id: true };
    jest.spyOn(FieldsParser, 'parse').mockReturnValue(projection as never);
    const validateProjectionSpy = jest
      .spyOn(FieldsValidator, 'validateProjection')
      .mockReturnValue();
    const validateNoNestedSpy = jest
      .spyOn(FieldsValidator, 'validateNoNestedSelection')
      .mockReturnValue();
    const validateIncludeSpy = jest
      .spyOn(FieldsValidator, 'validateIncludeRequirements')
      .mockReturnValue();

    const result = Fields.parseAndValidate('id', schema, {
      allowNested: true,
      requireIncludeForRelations: false,
    });

    expect(result).toEqual(projection);
    expect(validateProjectionSpy).toHaveBeenCalledWith(projection, schema);
    expect(validateNoNestedSpy).not.toHaveBeenCalled();
    expect(validateIncludeSpy).not.toHaveBeenCalled();
  });

  it('delegates project to FieldsProjector', () => {
    const projected = { id: '1' };
    const projectorSpy = jest.spyOn(FieldsProjector, 'project').mockReturnValue(projected as never);

    const result = Fields.project({ id: '1', email: 'x' }, { id: true });

    expect(projectorSpy).toHaveBeenCalledWith({ id: '1', email: 'x' }, { id: true });
    expect(result).toEqual(projected);
  });
});
