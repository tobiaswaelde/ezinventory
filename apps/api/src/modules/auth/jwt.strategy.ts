import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ApiAuth } from '~/config/api';
import { ENV } from '~/config/env';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, ApiAuth.JWT) {
  public static readonly token = 'JWT_PASSPORT_STRATEGY';

  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: ENV.AUTH_JWT_SECRET,
      issuer: ENV.AUTH_JWT_ISSUER,
    });
  }

  async validate(payload: JwtPayload) {
    return {
      id: payload.sub,
      email: payload.email,
    };
  }
}
