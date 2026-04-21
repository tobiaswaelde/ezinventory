export const AUTH_VALIDATION_MESSAGE_KEYS = {
  requiredEmailPassword: 'auth_validation_required_email_password',
  invalidEmail: 'auth_validation_invalid_email',
  weakPassword: 'auth_validation_weak_password',
  displayNameTooShort: 'auth_validation_display_name_too_short',
  passkeyEmailRequired: 'auth_validation_passkey_email_required',
  passkeyCredentialsRequired: 'auth_validation_passkey_credentials_required'
} as const;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const normalizeEmail = (value?: string): string => value?.trim().toLowerCase() ?? '';

export const normalizeText = (value?: string): string => value?.trim() ?? '';

export function validateEmail(value?: string): string | null {
  const email = normalizeEmail(value);
  if (!email) return AUTH_VALIDATION_MESSAGE_KEYS.invalidEmail;
  if (!EMAIL_REGEX.test(email)) return AUTH_VALIDATION_MESSAGE_KEYS.invalidEmail;
  return null;
}

export function validatePassword(value?: string): string | null {
  const password = value ?? '';
  if (!password.trim()) return AUTH_VALIDATION_MESSAGE_KEYS.requiredEmailPassword;
  if (password.length < 8) return AUTH_VALIDATION_MESSAGE_KEYS.weakPassword;
  return null;
}

export function validateSigninInput(payload: { email?: string; password?: string }): string | null {
  const emailError = validateEmail(payload.email);
  if (emailError) return emailError;

  const passwordError = validatePassword(payload.password);
  if (passwordError === AUTH_VALIDATION_MESSAGE_KEYS.requiredEmailPassword) {
    return AUTH_VALIDATION_MESSAGE_KEYS.requiredEmailPassword;
  }

  return passwordError;
}

export function validateSignupInput(payload: { email?: string; password?: string; displayName?: string }): string | null {
  const emailError = validateEmail(payload.email);
  if (emailError) return emailError;

  const passwordError = validatePassword(payload.password);
  if (passwordError) return passwordError;

  if (normalizeText(payload.displayName).length < 2) {
    return AUTH_VALIDATION_MESSAGE_KEYS.displayNameTooShort;
  }

  return null;
}

export function validatePasskeySigninInput(payload: { email?: string }): string | null {
  return validateEmail(payload.email) ? AUTH_VALIDATION_MESSAGE_KEYS.passkeyEmailRequired : null;
}

export function validatePasskeyRegistrationInput(payload: { email?: string; password?: string }): string | null {
  const emailError = validateEmail(payload.email);
  const password = payload.password ?? '';

  if (emailError || !password.trim()) {
    return AUTH_VALIDATION_MESSAGE_KEYS.passkeyCredentialsRequired;
  }

  if (password.length < 8) {
    return AUTH_VALIDATION_MESSAGE_KEYS.weakPassword;
  }

  return null;
}
