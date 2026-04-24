import { UserPreferencesGetPayload } from '@/generated/prisma/models';

export type UserPreferencesPayload = UserPreferencesGetPayload<{
  include: Record<string, never>;
}>;
