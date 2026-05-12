import { z } from 'zod/v4';

export type UserProfileDTO = {
  id: string;
  createdAt: string;
  updatedAt: string;

  firstname: string;
  lastname: string;
  avatarId?: string;
  avatarUrl?: string;
};

//#region create
export const createUserProfileSchema = z.object({
  firstname: z.string().max(255).nonempty().default(''),
  lastname: z.string().max(255).nonempty().default(''),
});
export type CreateUserProfileDTO = z.output<typeof createUserProfileSchema>;
//#endregion
//#region update
export const updateUserProfileSchema = z.object({
  firstname: z.string().max(255).nonempty().optional(),
  lastname: z.string().max(255).nonempty().optional(),
});
export type UpdateUserProfileDTO = z.output<typeof updateUserProfileSchema>;
//#endregion
