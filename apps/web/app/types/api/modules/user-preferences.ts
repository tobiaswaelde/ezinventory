import { z } from 'zod/v4';

export type UserPreferencesDTO = {
  id: string;
  createdAt: string;
  updatedAt: string;
  language: string;
  timezone?: string;
};

const timezones = Intl.supportedValuesOf('timeZone');

//#region create
export const createUserPreferencesSchema = z.object({
  language: z.string().max(10).nonempty().default('en-US'),
  timezone: z.enum(timezones).nonoptional().default('Europe/Berlin'),
});
export type CreateUserPreferencesDTO = z.output<typeof createUserPreferencesSchema>;
//#endregion
//#region update
export const updateUserPreferencesSchema = createUserPreferencesSchema.partial();
export type UpdateUserPreferencesDTO = z.output<typeof updateUserPreferencesSchema>;
//#endregion
