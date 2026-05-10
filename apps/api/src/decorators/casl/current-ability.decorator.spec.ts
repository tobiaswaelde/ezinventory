const mockCreateParamDecorator = jest.fn((factory) => factory);

jest.mock('@nestjs/common', () => {
  const actual = jest.requireActual('@nestjs/common');
  return {
    ...actual,
    createParamDecorator: mockCreateParamDecorator,
  };
});

import { CurrentAbility } from '~/decorators/casl/current-ability.decorator';

describe('CurrentAbility decorator', () => {
  it('extracts ability from request', () => {
    const ability = { can: jest.fn() };
    const ctx = {
      switchToHttp: () => ({
        getRequest: () => ({ ability }),
      }),
    };

    const result = (CurrentAbility as any)(undefined, ctx);

    expect(mockCreateParamDecorator).toHaveBeenCalled();
    expect(result).toBe(ability);
  });
});
