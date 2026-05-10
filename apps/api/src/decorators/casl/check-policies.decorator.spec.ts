const mockSetMetadata = jest.fn((key, value) => ({ key, value }));

jest.mock('@nestjs/common', () => {
  const actual = jest.requireActual('@nestjs/common');
  return {
    ...actual,
    SetMetadata: mockSetMetadata,
  };
});

import { CHECK_POLICIES_KEY, CheckPolicies } from '~/decorators/casl/check-policies.decorator';

describe('CheckPolicies decorator', () => {
  it('stores policy handlers in metadata', () => {
    const handlerA = jest.fn();
    const handlerB = jest.fn();

    const result = CheckPolicies(handlerA as never, handlerB as never);

    expect(mockSetMetadata).toHaveBeenCalledWith(CHECK_POLICIES_KEY, [handlerA, handlerB]);
    expect(result).toEqual({ key: CHECK_POLICIES_KEY, value: [handlerA, handlerB] });
  });
});
