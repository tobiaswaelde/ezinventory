import { UnauthorizedException, createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

import type { AuthenticatedUser } from '~/modules/auth/types/authenticated-user.type.js';

type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser;
};

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
  const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();

  if (!request.user) {
    throw new UnauthorizedException('Authenticated user not found.');
  }

  return request.user;
});
