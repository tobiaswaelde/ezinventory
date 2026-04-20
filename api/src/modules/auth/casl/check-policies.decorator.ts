import { SetMetadata } from '@nestjs/common';

import type { CaslAction, CaslSubject } from '~/modules/auth/casl/casl-ability.types.js';

export const CHECK_POLICIES_KEY = 'checkPolicies';

export type RequiredPolicy = {
  action: CaslAction;
  subject: CaslSubject;
};

export const CheckPolicies = (...policies: RequiredPolicy[]) => SetMetadata(CHECK_POLICIES_KEY, policies);
