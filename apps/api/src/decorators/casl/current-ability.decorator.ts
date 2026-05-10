import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AppAbility } from '~/types/casl';

/**
 * Decorator to extract the current user's ability from the current HTTP request.
 */
export const CurrentAbility = createParamDecorator((data, ctx: ExecutionContext): AppAbility => {
  const req = ctx.switchToHttp().getRequest();
  return req.ability;
});
