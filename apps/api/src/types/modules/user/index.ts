import { UserGetPayload } from '@/generated/prisma/models';
import { Optional } from '@prisma/client/runtime/client';

export type UserPayload = Optional<
  UserGetPayload<{
    include: {
      profile: true;
      preferences: true;
    };
  }>,
  'profile' | 'preferences'
>;
