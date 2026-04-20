import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PasskeyChallengePurpose } from '@prisma/client';
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
import { PrismaService } from '~/prisma/prisma.service.js';
import { LoginDto } from '~/modules/auth/dto/login.dto.js';
import { PasskeyLoginOptionsDto } from '~/modules/auth/dto/passkey-login-options.dto.js';
import { PasskeyLoginVerifyDto } from '~/modules/auth/dto/passkey-login-verify.dto.js';
import { PasskeyRegisterOptionsDto } from '~/modules/auth/dto/passkey-register-options.dto.js';
import { PasskeyRegisterVerifyDto } from '~/modules/auth/dto/passkey-register-verify.dto.js';

@Injectable()
export class AuthService {
  private readonly challengeLifetimeMs = 5 * 60 * 1000;

  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async login(dto: LoginDto): Promise<{ accessToken: string; refreshToken: string; email: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      select: { email: true, passwordHash: true }
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const passwordValid = await argon2.verify(user.passwordHash, dto.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    return this.issueTokens(user.email);
  }

  async passkeyRegisterOptions(
    dto: PasskeyRegisterOptionsDto
  ): Promise<{ challenge: string; options: Record<string, unknown>; email: string }> {
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

  async passkeyRegisterVerify(
    dto: PasskeyRegisterVerifyDto
  ): Promise<{ verified: true; credentialId: string; email: string }> {
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

  async passkeyLoginVerify(dto: PasskeyLoginVerifyDto): Promise<{ accessToken: string; refreshToken: string; email: string }> {
    const email = dto.email.toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
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

    return this.issueTokens(user.email);
  }

  private issueTokens(email: string): { accessToken: string; refreshToken: string; email: string } {
    return {
      accessToken: `access-${crypto.randomUUID()}`,
      refreshToken: `refresh-${crypto.randomUUID()}`,
      email
    };
  }

  private async storeChallenge(userId: string, purpose: PasskeyChallengePurpose, challenge: string): Promise<void> {
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

  private async consumeChallenge(userId: string, purpose: PasskeyChallengePurpose): Promise<string> {
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
