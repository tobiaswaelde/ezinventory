import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { MfaGuard } from '~/guards/mfa.guard';
import { MfaService } from '~/modules/auth/mfa/mfa.service';
import { ErrorCode } from '~/types/error-code';

jest.mock('~/modules/auth/mfa/mfa.service', () => ({
  MfaService: class {
    static token = 'MFA_SERVICE';
    verifyToken = jest.fn();
  },
}));

const makeContext = (user: any, body: any = {}): ExecutionContext =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({ user, body }),
    }),
  }) as unknown as ExecutionContext;

describe('MfaGuard', () => {
  let guard: MfaGuard;
  let mockMfaService: jest.Mocked<MfaService>;

  beforeEach(() => {
    mockMfaService = { verifyToken: jest.fn() } as unknown as jest.Mocked<MfaService>;
    guard = new MfaGuard(mockMfaService);
  });

  it('returns true when user does not have MFA enabled', async () => {
    const ctx = makeContext({ isMfaEnabled: false });
    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
  });

  it('throws ForbiddenException with mfaPending when MFA code is missing', async () => {
    const ctx = makeContext({ isMfaEnabled: true, mfaSecret: 'secret' }, {});

    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);

    try {
      await guard.canActivate(ctx);
    } catch (err: any) {
      expect(err.response?.mfaPending).toBe(true);
      expect(err.response?.message).toBe(ErrorCode.AuthMfaCodeRequired);
    }
  });

  it('throws ForbiddenException when TOTP code is invalid', async () => {
    mockMfaService.verifyToken.mockResolvedValue(false);
    const ctx = makeContext({ isMfaEnabled: true, mfaSecret: 'secret' }, { totp: '000000' });

    await expect(guard.canActivate(ctx)).rejects.toThrow(
      new ForbiddenException(ErrorCode.AuthMfaInvalidCode),
    );
  });

  it('returns true when valid TOTP code is provided', async () => {
    mockMfaService.verifyToken.mockResolvedValue(true);
    const ctx = makeContext({ isMfaEnabled: true, mfaSecret: 'secret' }, { totp: '123456' });

    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
    expect(mockMfaService.verifyToken).toHaveBeenCalledWith('123456', 'secret');
  });
});
