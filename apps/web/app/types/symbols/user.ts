import type { InjectionKey } from 'vue';
import type { UserDTO } from '~/types/api/modules/user';

export type UserContext = {
  user: UserDTO;
  refresh(): Promise<void>;
};

export const UserContextKey: InjectionKey<UserContext> = Symbol('user-context');
