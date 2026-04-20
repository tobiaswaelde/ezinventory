import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from '~/modules/auth/auth.controller.js';
import { AuthService } from '~/modules/auth/auth.service.js';
import { CaslAbilityFactory } from '~/modules/auth/casl/casl-ability.factory.js';
import { AccessTokenGuard } from '~/modules/auth/guards/access-token.guard.js';
import { PoliciesGuard } from '~/modules/auth/guards/policies.guard.js';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, CaslAbilityFactory, AccessTokenGuard, PoliciesGuard],
  exports: [JwtModule, CaslAbilityFactory, AccessTokenGuard, PoliciesGuard]
})
export class AuthModule {}
