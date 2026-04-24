import { UserProfileGetPayload } from '@/generated/prisma/models';

export type UserProfilePayload = UserProfileGetPayload<{
  include: never;
}>;
