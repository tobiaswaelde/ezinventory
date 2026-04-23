import { IsEmail, IsString, validate, ValidationError } from 'class-validator';
import { ValidationUtil } from '~/util/validation';

const makeError = (
  property: string,
  constraints: Record<string, string>,
  children?: ValidationError[],
): ValidationError => {
  const err = new ValidationError();
  err.property = property;
  err.constraints = constraints;
  // Use a plain object so constructor.name is 'Object' — getMetaData finds no registered
  // metadata for it and returns [], so processConstraints falls back to the no-meta branch.
  err.target = {};
  err.children = children ?? [];
  return err;
};

describe('ValidationUtil.mapValidationErrorsToObject', () => {
  it('returns empty object for empty errors array', () => {
    const result = ValidationUtil.mapValidationErrorsToObject([]);
    expect(result).toEqual({});
  });

  it('maps a single error with a constraint', () => {
    const error = makeError('email', { isEmail: 'email must be an email' });
    const result = ValidationUtil.mapValidationErrorsToObject([error]);

    expect(result.email).toBeDefined();
    const constraints = result.email as any[];
    expect(constraints).toHaveLength(1);
    expect(constraints[0].name).toBe('isEmail');
    expect(constraints[0].constraints).toEqual(['email must be an email']);
  });

  it('maps multiple constraints on the same property', () => {
    const error = makeError('password', {
      minLength: 'too short',
      matches: 'must contain a number',
    });
    const result = ValidationUtil.mapValidationErrorsToObject([error]);
    const constraints = result.password as any[];

    expect(constraints).toHaveLength(2);
    const names = constraints.map((c) => c.name);
    expect(names).toContain('minLength');
    expect(names).toContain('matches');
  });

  it('maps errors for multiple properties independently', () => {
    const errors = [
      makeError('email', { isEmail: 'must be an email' }),
      makeError('username', { minLength: 'too short' }),
    ];
    const result = ValidationUtil.mapValidationErrorsToObject(errors);

    expect(result.email).toBeDefined();
    expect(result.username).toBeDefined();
  });

  it('uses registered metadata when constraint matches a decorated class', async () => {
    // Use a real decorated class so class-validator metadata IS registered
    class UserDto {
      @IsString()
      @IsEmail()
      email: string;
    }

    const dto = Object.assign(new UserDto(), { email: 123 });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);

    const result = ValidationUtil.mapValidationErrorsToObject(errors);
    expect(result.email).toBeDefined();
    const constraints = result.email as any[];
    expect(Array.isArray(constraints)).toBe(true);
  });

  it('maps nested children errors into nested structure', () => {
    const child = makeError('street', { isString: 'must be a string' });
    const parent = makeError('address', {}, [child]);
    parent.constraints = undefined;

    const result = ValidationUtil.mapValidationErrorsToObject([parent]);
    expect((result.address as any).street).toBeDefined();
  });
});
