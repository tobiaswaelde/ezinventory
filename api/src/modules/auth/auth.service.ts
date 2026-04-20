import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import argon2 from 'argon2';

import { PrismaService } from '../../prisma/prisma.service.js';
import { LoginDto } from './dto/login.dto.js';
import { PasskeyLoginOptionsDto } from './dto/passkey-login-options.dto.js';

@Injectable()
export class AuthService {
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

    return {
      accessToken: `access-${crypto.randomUUID()}`,
      refreshToken: `refresh-${crypto.randomUUID()}`,
      email: user.email
    };
  }

  async passkeyLoginOptions(dto: PasskeyLoginOptionsDto): Promise<{ challenge: string; rpId: string; email: string }> {
    return {
      challenge: crypto.randomUUID().replaceAll('-', ''),
      rpId: 'localhost',
      email: dto.email.toLowerCase()
    };
  }
}
