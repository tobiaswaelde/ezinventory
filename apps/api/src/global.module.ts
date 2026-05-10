import { Global, Module } from '@nestjs/common';
import { CaslAbilityFactory } from '~/casl/ability.factory';

@Global()
@Module({
  providers: [{ provide: CaslAbilityFactory.token, useClass: CaslAbilityFactory }],
  exports: [CaslAbilityFactory.token],
})
export class GlobalModule {}
