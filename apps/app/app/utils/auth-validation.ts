export const AUTH_VALIDATION_MESSAGES = {
  requiredEmailPassword: 'Please provide email and password.',
  invalidEmail: 'Please provide a valid email address.',
  weakPassword: 'Password must have at least 8 characters.',
  displayNameTooShort: 'Display name must have at least 2 characters.',
  passkeyEmailRequired: 'Email is required for passkey login.',
  passkeyCredentialsRequired: 'Email and password are required for passkey registration.'
} as const;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const normalizeEmail = (value?: string): string => value?.trim().toLowerCase() ?? '';

export const normalizeText = (value?: string): string => value?.trim() ?? '';

export function validateEmail(value?: string): string | null {
  const email = normalizeEmail(value);
  if (!email) return AUTH_VALIDATION_MESSAGES.invalidEmail;
  if (!EMAIL_REGEX.test(email)) return AUTH_VALIDATION_MESSAGES.invalidEmail;
  return null;
}

export function validatePassword(value?: string): string | null {
  const password = value ?? '';
  if (!password.trim()) return AUTH_VALIDATION_MESSAGES.requiredEmailPassword;
  if (password.length < 8) return AUTH_VALIDATION_MESSAGES.weakPassword;
  return null;
}

export function validateSigninInput(payload: { email?: string; password?: string }): string | null {
  const emailError = validateEmail(payload.email);
  if (emailError) return emailError;

  const passwordError = validatePassword(payload.password);
  if (passwordError === AUTH_VALIDATION_MESSAGES.requiredEmailPassword) {
    return AUTH_VALIDATION_MESSAGES.requiredEmailPassword;
  }

  return passwordError;
}

export function validateSignupInput(payload: { email?: string; password?: string; displayName?: string }): string | null {
  const emailError = validateEmail(payload.email);
  if (emailError) return emailError;

  const passwordError = validatePassword(payload.password);
  if (passwordError) return passwordError;

  if (normalizeText(payload.displayName).length < 2) {
    return AUTH_VALIDATION_MESSAGES.displayNameTooShort;
  }

  return null;
}

export function validatePasskeySigninInput(payload: { email?: string }): string | null {
  return validateEmail(payload.email) ? AUTH_VALIDATION_MESSAGES.passkeyEmailRequired : null;
}

export function validatePasskeyRegistrationInput(payload: { email?: string; password?: string }): string | null {
  const emailError = validateEmail(payload.email);
  const password = payload.password ?? '';

  if (emailError || !password.trim()) {
    return AUTH_VALIDATION_MESSAGES.passkeyCredentialsRequired;
  }

  if (password.length < 8) {
    return AUTH_VALIDATION_MESSAGES.weakPassword;
  }

  return null;
}
