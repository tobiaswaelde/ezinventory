import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import { CaslAbilityFactory } from '~/modules/auth/casl/casl-ability.factory.js';
import { CHECK_POLICIES_KEY, type RequiredPolicy } from '~/modules/auth/casl/check-policies.decorator.js';
import type { AuthenticatedUser } from '~/modules/auth/types/authenticated-user.type.js';

type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser;
};

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    @Inject(Reflector) private readonly reflector: Reflector,
    @Inject(CaslAbilityFactory) private readonly caslAbilityFactory: CaslAbilityFactory
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPolicies = this.reflector.getAllAndOverride<RequiredPolicy[]>(CHECK_POLICIES_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if (!requiredPolicies || requiredPolicies.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!request.user) {
      throw new UnauthorizedException('User context is missing.');
    }

    const ability = await this.caslAbilityFactory.createForUser(request.user);
    const allAllowed = requiredPolicies.every((policy) => ability.can(policy.action, policy.subject));

    if (!allAllowed) {
      throw new ForbiddenException('Missing required permissions.');
    }

    return true;
  }
}
