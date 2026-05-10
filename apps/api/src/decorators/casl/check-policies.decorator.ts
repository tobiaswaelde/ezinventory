import { SetMetadata } from '@nestjs/common';
import { PolicyHandler } from '~/casl/policy-handler.interface';

export const CHECK_POLICIES_KEY = 'CHECK_POLICIES';

export const CheckPolicies = (...handlers: PolicyHandler[]) =>
  SetMetadata(CHECK_POLICIES_KEY, handlers);
