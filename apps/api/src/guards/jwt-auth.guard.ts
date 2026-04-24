import {
  ExecutionContext,
  ForbiddenException,
  HttpException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { jwtVerifyOptions } from '~/config/jwt';
import { PrismaService } from '~/prisma/prisma.service';
import { ErrorCode } from '~/types/error-code';

/**
 * Auth guard to verify JWT token.
 *
 * Also checks if MFA is pending.
 *
 * @throws {UnauthorizedException} ErrorCode.AuthNoTokenProvided
 * @throws {ForbiddenException} ErrorCode.AuthMfaVerificationRequired
 * @throws {NotFoundException} ErrorCode.AuthInvalidCredentials
 * @throws {UnauthorizedException} ErrorCode.AuthInvalidToken
 */
@Injectable()
export class JwtAuthGuard {
  constructor(
    private jwtService: JwtService,
    private readonly db: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const token = this.extractTokenFromHeader(req);
    if (!token) {
      throw new UnauthorizedException(ErrorCode.AuthNoTokenProvided);
    }

    try {
      const payload: JwtPayloadMfa = await this.jwtService.verifyAsync(token, jwtVerifyOptions);
      if (payload.mfaPending) {
        throw new ForbiddenException(ErrorCode.AuthMfaVerificationRequired);
      }

      const user = await this.db.user.findUnique({ where: { id: payload.sub } });
      if (!user) {
        throw new NotFoundException(ErrorCode.AuthInvalidCredentials);
      }

      req.user = user;
      // req.ability = await this.caslFactory.createForUser(user);
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new UnauthorizedException(ErrorCode.AuthInvalidToken);
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return null;
    }

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
