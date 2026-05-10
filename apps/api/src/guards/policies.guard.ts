import { ErrorCode } from '@ezinventory/shared/types/error-code';
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PolicyHandler } from '~/casl/policy-handler.interface';
import { ENV } from '~/config/env';
import { CHECK_POLICIES_KEY } from '~/decorators/casl/check-policies.decorator';

/**
 * Guard to check policies using CASL.
 *
 * @throws {ForbiddenException} ErrorCode.InsufficientPermissions
 */
@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const handlers =
      this.reflector.get<PolicyHandler[]>(CHECK_POLICIES_KEY, context.getHandler()) || [];

    // only throw 403 in production environments
    if (ENV.isProduction) {
      return handlers.every((handler) => handler(request.ability));
    }

    // detailed errors in non-production environments
    for (const handler of handlers) {
      if (!request.ability) {
        throw new ForbiddenException(ErrorCode.InsufficientPermissions);
      }

      const result = handler(request.ability);

      if (!result) {
        throw new ForbiddenException({
          error: ErrorCode.InsufficientPermissions,
          message: 'Insufficient permissions to access this resource.',
          requiredPolicies: handlers.map((h) => h.name || h.toString()),
          ability: request.ability?.rules || undefined,
        });
      }
    }

    return true;
  }
}
