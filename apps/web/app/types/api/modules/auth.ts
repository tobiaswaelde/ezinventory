import type { UserDTO } from '~/types/api/modules/user';
import z from 'zod/v4';

export type AuthResultDTO = {
  user?: UserDTO;
  token: string;
  mfaPending: boolean;
};

//#region MFA
export type MfaSetupDTO = {
  secret: string;
  dataUrl: string;
  otpAuth: string;
};

export type MfaEnableDTO = {
  secret: string;
  totp: string;
};

export const mfaVerifySchema = z.object({
  totp: z.string().min(6).max(6).optional(),
});
export type MfaVerifyDTO = z.output<typeof mfaVerifySchema>;
//#endregion
//#region signin
export const signinSchema = z
  .object({
    email: z.email().max(255).nonempty().default(''),
    password: z.string().max(72).nonempty().default(''),
  })
  .extend(mfaVerifySchema.shape);
export type SigninDTO = z.output<typeof signinSchema>;
//#endregion

//#region update password
export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().max(72).nonempty().default(''),
    newPassword: z.string().max(72).nonempty().default(''),
    confirmPassword: z.string().max(72).nonempty().default(''),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords must match', //TODO add translation
    path: ['confirmPassword'],
  });
export type UpdatePasswordDTO = z.output<typeof updatePasswordSchema>;
//#endregion
