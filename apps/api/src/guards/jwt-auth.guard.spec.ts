import {
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CaslAbilityFactory } from '~/casl/ability.factory';
import { JwtAuthGuard } from '~/guards/jwt-auth.guard';
import { PrismaService } from '~/prisma/prisma.service';
import { ErrorCode } from '~/types/error-code';

const makeContext = (request: any): ExecutionContext => {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as any;
};

const makeRequest = (authHeader?: string) => ({
  headers: authHeader ? { authorization: authHeader } : {},
  user: undefined as any,
  ability: undefined as any,
});

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let mockJwtService: jest.Mocked<Pick<JwtService, 'verifyAsync'>>;
  let mockDb: any;
  let mockCaslFactory: jest.Mocked<Pick<CaslAbilityFactory, 'createForUser'>>;

  beforeEach(() => {
    mockJwtService = { verifyAsync: jest.fn() } as any;
    mockDb = { user: { findUnique: jest.fn() } };
    mockCaslFactory = { createForUser: jest.fn().mockResolvedValue({ rules: [] }) } as any;

    guard = new JwtAuthGuard(
      mockJwtService as any,
      mockDb as unknown as PrismaService,
      mockCaslFactory as any,
    );

    jest.clearAllMocks();
  });

  it('throws UnauthorizedException when no auth header is provided', async () => {
    const req = makeRequest();
    const ctx = makeContext(req);

    await expect(guard.canActivate(ctx)).rejects.toThrow(
      new UnauthorizedException(ErrorCode.AuthNoTokenProvided),
    );
  });

  it('throws UnauthorizedException when token type is not Bearer', async () => {
    const req = makeRequest('Basic some-token');
    const ctx = makeContext(req);

    await expect(guard.canActivate(ctx)).rejects.toThrow(
      new UnauthorizedException(ErrorCode.AuthNoTokenProvided),
    );
  });

  it('throws ForbiddenException when token has mfaPending flag', async () => {
    mockJwtService.verifyAsync.mockResolvedValue({ sub: 'user-1', mfaPending: true } as any);
    const req = makeRequest('Bearer mfa-pending-token');
    const ctx = makeContext(req);

    await expect(guard.canActivate(ctx)).rejects.toThrow(
      new ForbiddenException(ErrorCode.AuthMfaVerificationRequired),
    );
  });

  it('throws NotFoundException when user is not found in DB', async () => {
    mockJwtService.verifyAsync.mockResolvedValue({ sub: 'nonexistent', mfaPending: false } as any);
    mockDb.user.findUnique.mockResolvedValue(null);
    const req = makeRequest('Bearer valid-token');
    const ctx = makeContext(req);

    await expect(guard.canActivate(ctx)).rejects.toThrow(NotFoundException);
  });

  it('sets user and ability on request and returns true for valid token', async () => {
    const user = { id: 'user-1', email: 'user@test.com' };
    mockJwtService.verifyAsync.mockResolvedValue({ sub: 'user-1', mfaPending: false } as any);
    mockDb.user.findUnique.mockResolvedValue(user);
    mockCaslFactory.createForUser.mockResolvedValue({ rules: ['rule'] } as any);

    const req = makeRequest('Bearer valid-token');
    const ctx = makeContext(req);

    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
    expect(req.user).toEqual(user);
    expect(req.ability).toBeDefined();
    expect(mockCaslFactory.createForUser).toHaveBeenCalledWith(user);
  });

  it('throws UnauthorizedException when token verification fails', async () => {
    mockJwtService.verifyAsync.mockRejectedValue(new Error('invalid signature'));
    const req = makeRequest('Bearer bad-token');
    const ctx = makeContext(req);

    await expect(guard.canActivate(ctx)).rejects.toThrow(
      new UnauthorizedException(ErrorCode.AuthInvalidToken),
    );
  });
});
