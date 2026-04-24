import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { MfaService } from '~/modules/auth/mfa/mfa.service';
import { AuthRequest } from '~/types/auth-request';
import { ErrorCode } from '~/types/error-code';

/**
 * Guard to enforce MFA verification.
 *
 * @throws {ForbiddenException} ErrorCode.AuthMfaCodeRequired
 * @throws {ForbiddenException} ErrorCode.AuthMfaInvalidCode
 */
@Injectable()
export class MfaGuard implements CanActivate {
  constructor(@Inject(MfaService.token) private readonly mfaService: MfaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest() as AuthRequest;
    const user = req.user;

    // skip if user has not enabled MFA
    if (!user.isMfaEnabled) {
      return true;
    }

    // check if TOTP is provided in request body
    if (!req.body?.totp) {
      throw new ForbiddenException({
        mfaPending: true,
        message: ErrorCode.AuthMfaCodeRequired,
      });
    }

    // verify TOTP token
    const ok = await this.mfaService.verifyToken(req.body.totp, user.mfaSecret);
    if (!ok) {
      throw new ForbiddenException(ErrorCode.AuthMfaInvalidCode);
    }

    return true;
  }
}
