import { Request } from 'express';
import { AppAbility } from '~/casl/ability.factory';
import { UserPayload } from '~/types/modules/user';

export interface AuthRequest extends Request {
  user: UserPayload;
  ability: AppAbility;
}
