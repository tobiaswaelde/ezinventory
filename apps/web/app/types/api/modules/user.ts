import { z } from 'zod/v4';
import { UserRole } from '~/types/api/enums/user-role';
import { createUserPreferencesSchema, type UserPreferencesDTO } from '~/types/api/modules/user-preferences';
import { createUserProfileSchema, type UserProfileDTO } from '~/types/api/modules/user-profile';

export type UserDTO = {
  id: string;
  createdAt: string;
  updatedAt: string;

  email: string;
  passwordChangedAt: string;
  isMfaEnabled: boolean;
  mfaSecret?: string;
  role?: UserRole;
  websocketToken: string;
  profile?: UserProfileDTO;
  preferences?: UserPreferencesDTO;
};

//#region create
export const createUserSchema = z.object({
  email: z.email().max(255).nonempty().default(''),
  password: z.string().max(72).nonempty().default(''),
  role: z.enum(UserRole).optional().default(UserRole.User),
  profile: createUserProfileSchema.default(createUserProfileSchema.parse({})),
  preferences: createUserPreferencesSchema.default(createUserPreferencesSchema.parse({})),
});
export type CreateUserDTO = z.output<typeof createUserSchema>;
//#endregion
//#region update
export const updateUserSchema = z.object({
  role: z
    .enum(UserRole)
    .optional()
    .nullable()
    .transform((x) => x || undefined),
});
export type UpdateUserDTO = z.output<typeof updateUserSchema>;
//#endregion

//#region endpoint
export const UsersEndpoint = 'users' as const;
export type UsersEndpoints = {
  [UsersEndpoint]: {
    dto: UserDTO;
    create: CreateUserDTO;
    update: UpdateUserDTO;
  };
};
//#endregion
