import { AppAbility } from '~/casl/ability.factory';

export interface PolicyHandler {
  (ability: AppAbility): boolean;
}
