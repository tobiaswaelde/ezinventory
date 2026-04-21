import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import prismaClient from '@prisma/client';
import type { PasskeyChallengePurpose as PasskeyChallengePurposeType, UserRole as UserRoleType } from '@prisma/client';
import argon2 from 'argon2';
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
  type AuthenticatorTransportFuture,
  type AuthenticationResponseJSON,
  type RegistrationResponseJSON,
  type WebAuthnCredential
} from '@simplewebauthn/server';

import { ENV } from '~/config/env.js';
import { LoginDto } from '~/modules/auth/dto/login.dto.js';
import { PasskeyLoginOptionsDto } from '~/modules/auth/dto/passkey-login-options.dto.js';
import { PasskeyLoginVerifyDto } from '~/modules/auth/dto/passkey-login-verify.dto.js';
import { PasskeyRegisterOptionsDto } from '~/modules/auth/dto/passkey-register-options.dto.js';
import { PasskeyRegisterVerifyDto } from '~/modules/auth/dto/passkey-register-verify.dto.js';
import { RefreshTokenDto } from '~/modules/auth/dto/refresh-token.dto.js';
import { RegisterDto } from '~/modules/auth/dto/register.dto.js';
import type { AuthenticatedUser } from '~/modules/auth/types/authenticated-user.type.js';
import { PrismaService } from '~/prisma/prisma.service.js';
import { REGISTRATION_MODE_KEY, SETUP_INITIALIZED_KEY } from '~/modules/setup/setup.constants.js';
import { RegistrationMode } from '~/modules/setup/dto/update-registration-mode.dto.js';

const { PasskeyChallengePurpose, UserRole } = prismaClient as typeof import('@prisma/client');

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  email: string;
};

type RefreshTokenPayload = {
  sub: string;
  sid: string;
  type: 'refresh';
};

@Injectable()
export class AuthService {
  private readonly challengeLifetimeMs = 5 * 60 * 1000;
  private readonly tokenIssuer = 'ezinventory-api';
  private readonly tokenAudience = 'ezinventory-app';

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(JwtService) private readonly jwtService: JwtService
  ) {}

  async login(dto: LoginDto): Promise<AuthTokens> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      select: { id: true, email: true, passwordHash: true, role: true, preferredLanguage: true }
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const passwordValid = await argon2.verify(user.passwordHash, dto.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    return await this.issueTokens({ id: user.id, email: user.email, role: user.role, preferredLanguage: user.preferredLanguage });
  }

  async me(userId: string): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        preferredLanguage: true
      }
    });

    if (!user) {
      throw new UnauthorizedException('Authenticated user no longer exists.');
    }

    return user;
  }

  async register(dto: RegisterDto): Promise<AuthTokens> {
    const setupInitializedSetting = await this.prisma.systemSetting.findUnique({
      where: { key: SETUP_INITIALIZED_KEY },
      select: { value: true }
    });

    if (!setupInitializedSetting || setupInitializedSetting.value !== true) {
      throw new NotFoundException('Setup is not initialized yet.');
    }

    const registrationModeSetting = await this.prisma.systemSetting.findUnique({
      where: { key: REGISTRATION_MODE_KEY },
      select: { value: true }
    });

    const registrationModeValue =
      typeof registrationModeSetting?.value === 'string' ? registrationModeSetting.value : RegistrationMode.ADMIN_ONLY;

    if (registrationModeValue !== RegistrationMode.OPEN) {
      throw new ForbiddenException('Public registration is disabled.');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      select: { id: true }
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists.');
    }

    const passwordHash = await argon2.hash(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        displayName: dto.displayName,
        passwordHash,
        role: UserRole.STAFF,
        preferredLanguage: dto.preferredLanguage ?? 'en'
      },
      select: {
        id: true,
        email: true,
        role: true,
        preferredLanguage: true
      }
    });

    return await this.issueTokens({ id: user.id, email: user.email, role: user.role, preferredLanguage: user.preferredLanguage });
  }

  async passkeyRegisterOptions(dto: PasskeyRegisterOptionsDto): Promise<{ challenge: string; options: Record<string, unknown>; email: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        passkeyCredentials: {
          select: {
            credentialId: true,
            transports: true
          }
        }
      }
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const passwordValid = await argon2.verify(user.passwordHash, dto.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const options = await generateRegistrationOptions({
      rpName: ENV.AUTH_PASSKEY_RP_NAME,
      rpID: ENV.AUTH_PASSKEY_RP_ID,
      userID: new TextEncoder().encode(user.id),
      userName: user.email,
      userDisplayName: user.email,
      attestationType: 'none',
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred'
      },
      excludeCredentials: user.passkeyCredentials.map((credential) => ({
        id: credential.credentialId,
        transports: this.toTransportsArray(credential.transports)
      }))
    });

    await this.storeChallenge(user.id, PasskeyChallengePurpose.REGISTRATION, options.challenge);

    return {
      challenge: options.challenge,
      options: options as unknown as Record<string, unknown>,
      email: user.email
    };
  }

  async passkeyRegisterVerify(dto: PasskeyRegisterVerifyDto): Promise<{ verified: true; credentialId: string; email: string }> {
    const email = dto.email.toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true }
    });

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    const expectedChallenge = await this.consumeChallenge(user.id, PasskeyChallengePurpose.REGISTRATION);

    const verification = await verifyRegistrationResponse({
      response: dto.response as unknown as RegistrationResponseJSON,
      expectedChallenge,
      expectedOrigin: ENV.AUTH_PASSKEY_ORIGIN,
      expectedRPID: ENV.AUTH_PASSKEY_RP_ID,
      requireUserVerification: true
    });

    if (!verification.verified || !verification.registrationInfo) {
      throw new BadRequestException('Passkey registration verification failed.');
    }

    const { credential } = verification.registrationInfo;

    await this.prisma.passkeyCredential.upsert({
      where: { credentialId: credential.id },
      update: {
        publicKey: Buffer.from(credential.publicKey).toString('base64url'),
        counter: credential.counter,
        transports: (credential.transports ?? []) as unknown as object,
        deviceName: dto.deviceName ?? null,
        lastUsedAt: null
      },
      create: {
        userId: user.id,
        credentialId: credential.id,
        publicKey: Buffer.from(credential.publicKey).toString('base64url'),
        counter: credential.counter,
        transports: (credential.transports ?? []) as unknown as object,
        deviceName: dto.deviceName ?? null
      }
    });

    return {
      verified: true,
      credentialId: credential.id,
      email: user.email
    };
  }

  async passkeyLoginOptions(dto: PasskeyLoginOptionsDto): Promise<{ challenge: string; options: Record<string, unknown>; email: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      select: {
        id: true,
        email: true,
        passkeyCredentials: {
          select: {
            credentialId: true,
            transports: true
          }
        }
      }
    });

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    if (user.passkeyCredentials.length === 0) {
      throw new UnauthorizedException('No passkeys registered for this user.');
    }

    const options = await generateAuthenticationOptions({
      rpID: ENV.AUTH_PASSKEY_RP_ID,
      userVerification: 'preferred',
      allowCredentials: user.passkeyCredentials.map((credential) => ({
        id: credential.credentialId,
        transports: this.toTransportsArray(credential.transports)
      }))
    });

    await this.storeChallenge(user.id, PasskeyChallengePurpose.AUTHENTICATION, options.challenge);

    return {
      challenge: options.challenge,
      options: options as unknown as Record<string, unknown>,
      email: user.email
    };
  }

  async passkeyLoginVerify(dto: PasskeyLoginVerifyDto): Promise<AuthTokens> {
    const email = dto.email.toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        role: true,
        preferredLanguage: true,
        passkeyCredentials: {
          select: {
            id: true,
            credentialId: true,
            publicKey: true,
            counter: true,
            transports: true
          }
        }
      }
    });

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    const expectedChallenge = await this.consumeChallenge(user.id, PasskeyChallengePurpose.AUTHENTICATION);
    const response = dto.response as unknown as AuthenticationResponseJSON;

    const credential = user.passkeyCredentials.find((entry) => entry.credentialId === response.id);
    if (!credential) {
      throw new UnauthorizedException('Passkey credential not found for user.');
    }

    const webAuthnCredential: WebAuthnCredential = {
      id: credential.credentialId,
      publicKey: new Uint8Array(Buffer.from(credential.publicKey, 'base64url')),
      counter: credential.counter,
      transports: this.toTransportsArray(credential.transports)
    };

    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge,
      expectedOrigin: ENV.AUTH_PASSKEY_ORIGIN,
      expectedRPID: ENV.AUTH_PASSKEY_RP_ID,
      credential: webAuthnCredential,
      requireUserVerification: true
    });

    if (!verification.verified) {
      throw new UnauthorizedException('Passkey authentication failed.');
    }

    await this.prisma.passkeyCredential.update({
      where: { id: credential.id },
      data: {
        counter: verification.authenticationInfo.newCounter,
        lastUsedAt: new Date()
      }
    });

    return await this.issueTokens({ id: user.id, email: user.email, role: user.role, preferredLanguage: user.preferredLanguage });
  }

  async refresh(dto: RefreshTokenDto): Promise<AuthTokens> {
    const payload = await this.verifyRefreshToken(dto.refreshToken);

    const session = await this.prisma.refreshTokenSession.findUnique({
      where: { id: payload.sid },
      select: {
        id: true,
        userId: true,
        tokenHash: true,
        expiresAt: true,
        revokedAt: true,
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            preferredLanguage: true
          }
        }
      }
    });

    if (!session || session.userId !== payload.sub) {
      throw new UnauthorizedException('Refresh session is invalid.');
    }

    if (session.revokedAt !== null) {
      throw new UnauthorizedException('Refresh session has been revoked.');
    }

    if (session.expiresAt.getTime() < Date.now()) {
      await this.prisma.refreshTokenSession.update({
        where: { id: session.id },
        data: { revokedAt: new Date() }
      });
      throw new UnauthorizedException('Refresh token has expired.');
    }

    const tokenMatches = await argon2.verify(session.tokenHash, dto.refreshToken);
    if (!tokenMatches) {
      await this.prisma.refreshTokenSession.update({
        where: { id: session.id },
        data: { revokedAt: new Date() }
      });
      throw new UnauthorizedException('Refresh token is invalid.');
    }

    await this.prisma.refreshTokenSession.update({
      where: { id: session.id },
      data: { revokedAt: new Date() }
    });

    return await this.issueTokens({
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
      preferredLanguage: session.user.preferredLanguage
    });
  }

  async updatePreferredLanguage(
    userId: string,
    preferredLanguage: 'de' | 'en'
  ): Promise<{ id: string; preferredLanguage: 'de' | 'en' }> {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { preferredLanguage },
      select: {
        id: true,
        preferredLanguage: true
      }
    });

    return {
      id: updated.id,
      preferredLanguage: updated.preferredLanguage as 'de' | 'en'
    };
  }

  async logout(dto: RefreshTokenDto): Promise<{ loggedOut: true }> {
    const payload = await this.verifyRefreshToken(dto.refreshToken);

    const session = await this.prisma.refreshTokenSession.findUnique({
      where: { id: payload.sid },
      select: { id: true, userId: true, revokedAt: true }
    });

    if (!session || session.userId !== payload.sub || session.revokedAt !== null) {
      throw new UnauthorizedException('Refresh session is invalid.');
    }

    await this.prisma.refreshTokenSession.update({
      where: { id: session.id },
      data: { revokedAt: new Date() }
    });

    return { loggedOut: true };
  }

  async listPasskeys(userId: string): Promise<Array<{ id: string; deviceName: string | null; createdAt: Date; lastUsedAt: Date | null }>> {
    return await this.prisma.passkeyCredential.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        deviceName: true,
        createdAt: true,
        lastUsedAt: true
      }
    });
  }

  async deletePasskey(userId: string, passkeyId: string): Promise<{ id: string; deleted: true }> {
    const passkey = await this.prisma.passkeyCredential.findUnique({
      where: { id: passkeyId },
      select: { id: true, userId: true }
    });

    if (!passkey || passkey.userId !== userId) {
      throw new NotFoundException('Passkey not found.');
    }

    await this.prisma.passkeyCredential.delete({ where: { id: passkeyId } });

    return { id: passkeyId, deleted: true };
  }

  private async issueTokens(user: { id: string; email: string; role: UserRoleType; preferredLanguage: string }): Promise<AuthTokens> {
    const sessionId = crypto.randomUUID();

    const accessToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        preferredLanguage: user.preferredLanguage,
        type: 'access'
      },
      {
        secret: ENV.AUTH_ACCESS_TOKEN_SECRET,
        issuer: this.tokenIssuer,
        audience: this.tokenAudience,
        expiresIn: this.parseDurationToMs(ENV.AUTH_ACCESS_TOKEN_TTL) / 1000
      }
    );

    const refreshToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        sid: sessionId,
        type: 'refresh'
      },
      {
        secret: ENV.AUTH_REFRESH_TOKEN_SECRET,
        issuer: this.tokenIssuer,
        audience: this.tokenAudience,
        expiresIn: this.parseDurationToMs(ENV.AUTH_REFRESH_TOKEN_TTL) / 1000
      }
    );

    await this.prisma.refreshTokenSession.create({
      data: {
        id: sessionId,
        userId: user.id,
        tokenHash: await argon2.hash(refreshToken),
        expiresAt: new Date(Date.now() + this.parseDurationToMs(ENV.AUTH_REFRESH_TOKEN_TTL))
      }
    });

    await this.prisma.refreshTokenSession.deleteMany({
      where: {
        userId: user.id,
        OR: [{ revokedAt: { not: null } }, { expiresAt: { lt: new Date() } }]
      }
    });

    return {
      accessToken,
      refreshToken,
      email: user.email
    };
  }

  private async verifyRefreshToken(refreshToken: string): Promise<RefreshTokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(refreshToken, {
        secret: ENV.AUTH_REFRESH_TOKEN_SECRET,
        issuer: this.tokenIssuer,
        audience: this.tokenAudience
      });

      if (payload.type !== 'refresh' || typeof payload.sub !== 'string' || typeof payload.sid !== 'string') {
        throw new UnauthorizedException('Refresh token payload is invalid.');
      }

      return payload;
    } catch {
      throw new UnauthorizedException('Refresh token is invalid or expired.');
    }
  }

  private parseDurationToMs(duration: string): number {
    const matched = duration.match(/^(\d+)(s|m|h|d)$/);
    if (!matched) {
      throw new InternalServerErrorException('Invalid auth token TTL format in environment.');
    }

    const value = Number(matched[1]);
    const unit = matched[2];

    const unitMs: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000
    };

    return value * unitMs[unit];
  }

  private async storeChallenge(userId: string, purpose: PasskeyChallengePurposeType, challenge: string): Promise<void> {
    await this.prisma.passkeyChallenge.upsert({
      where: { userId_purpose: { userId, purpose } },
      update: {
        challenge,
        expiresAt: new Date(Date.now() + this.challengeLifetimeMs)
      },
      create: {
        userId,
        purpose,
        challenge,
        expiresAt: new Date(Date.now() + this.challengeLifetimeMs)
      }
    });
  }

  private async consumeChallenge(userId: string, purpose: PasskeyChallengePurposeType): Promise<string> {
    const challenge = await this.prisma.passkeyChallenge.findUnique({
      where: { userId_purpose: { userId, purpose } }
    });

    if (!challenge) {
      throw new UnauthorizedException('Passkey challenge not found.');
    }

    if (challenge.expiresAt.getTime() < Date.now()) {
      await this.prisma.passkeyChallenge.delete({ where: { id: challenge.id } });
      throw new UnauthorizedException('Passkey challenge has expired.');
    }

    await this.prisma.passkeyChallenge.delete({ where: { id: challenge.id } });
    return challenge.challenge;
  }

  private toTransportsArray(transports: unknown): AuthenticatorTransportFuture[] {
    const allowed = new Set<AuthenticatorTransportFuture>(['ble', 'cable', 'hybrid', 'internal', 'nfc', 'smart-card', 'usb']);

    if (!Array.isArray(transports)) {
      return [];
    }

    return transports.filter(
      (value): value is AuthenticatorTransportFuture => typeof value === 'string' && allowed.has(value as AuthenticatorTransportFuture)
    );
  }
}
