import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import { ENV } from '~/config/env.js';
import { IS_PUBLIC_KEY } from '~/modules/auth/decorators/public.decorator.js';
import type { AuthenticatedUser } from '~/modules/auth/types/authenticated-user.type.js';
import type { AccessTokenPayload } from '~/modules/auth/types/access-token-payload.type.js';

type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser;
};

@Injectable()
export class AccessTokenGuard implements CanActivate {
  private readonly tokenIssuer = 'ezinventory-api';
  private readonly tokenAudience = 'ezinventory-app';

  constructor(
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(Reflector) private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractBearerToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing bearer token.');
    }

    let payload: AccessTokenPayload;

    try {
      payload = await this.jwtService.verifyAsync<AccessTokenPayload>(token, {
        secret: ENV.AUTH_ACCESS_TOKEN_SECRET,
        issuer: this.tokenIssuer,
        audience: this.tokenAudience
      });
    } catch {
      throw new UnauthorizedException('Access token is invalid or expired.');
    }

    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid access token type.');
    }

    request.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      preferredLanguage: payload.preferredLanguage ?? 'en'
    };

    return true;
  }

  private extractBearerToken(request: Request): string | null {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' && token ? token : null;
  }
}
