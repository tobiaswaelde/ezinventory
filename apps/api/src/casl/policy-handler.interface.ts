import { AppAbility } from '~/types/casl';

export interface PolicyHandler {
  (ability: AppAbility): boolean;
}
