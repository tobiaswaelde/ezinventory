import { describe, expect, it } from 'vitest';

import {
  AUTH_VALIDATION_MESSAGE_KEYS,
  normalizeEmail,
  normalizeText,
  validateEmail,
  validatePassword,
  validateSigninInput,
  validateSignupInput,
  validatePasskeySigninInput,
  validatePasskeyRegistrationInput
} from '../../app/utils/auth-validation';

describe('auth validation utilities', () => {
  it('normalizes input strings', () => {
    expect(normalizeEmail('  USER@Example.COM  ')).toBe('user@example.com');
    expect(normalizeEmail(undefined)).toBe('');
    expect(normalizeText('  Device Name  ')).toBe('Device Name');
    expect(normalizeText(undefined)).toBe('');
  });

  it('validates email and password rules', () => {
    expect(validateEmail('')).toBe(AUTH_VALIDATION_MESSAGE_KEYS.invalidEmail);
    expect(validateEmail('invalid')).toBe(AUTH_VALIDATION_MESSAGE_KEYS.invalidEmail);
    expect(validateEmail('valid@example.com')).toBeNull();

    expect(validatePassword(undefined)).toBe(AUTH_VALIDATION_MESSAGE_KEYS.requiredEmailPassword);
    expect(validatePassword('')).toBe(AUTH_VALIDATION_MESSAGE_KEYS.requiredEmailPassword);
    expect(validatePassword('1234567')).toBe(AUTH_VALIDATION_MESSAGE_KEYS.weakPassword);
    expect(validatePassword('12345678')).toBeNull();
  });

  it('validates sign-in payload', () => {
    expect(validateSigninInput({ email: 'invalid', password: '12345678' })).toBe(AUTH_VALIDATION_MESSAGE_KEYS.invalidEmail);
    expect(validateSigninInput({ email: 'valid@example.com', password: '' })).toBe(
      AUTH_VALIDATION_MESSAGE_KEYS.requiredEmailPassword
    );
    expect(validateSigninInput({ email: 'valid@example.com', password: '1234567' })).toBe(
      AUTH_VALIDATION_MESSAGE_KEYS.weakPassword
    );
    expect(validateSigninInput({ email: 'valid@example.com', password: '12345678' })).toBeNull();
  });

  it('validates sign-up payload', () => {
    expect(validateSignupInput({ email: 'invalid', password: '12345678', displayName: 'Alex' })).toBe(
      AUTH_VALIDATION_MESSAGE_KEYS.invalidEmail
    );
    expect(validateSignupInput({ email: 'valid@example.com', password: '1234567', displayName: 'Alex' })).toBe(
      AUTH_VALIDATION_MESSAGE_KEYS.weakPassword
    );
    expect(validateSignupInput({ email: 'valid@example.com', password: '12345678', displayName: 'A' })).toBe(
      AUTH_VALIDATION_MESSAGE_KEYS.displayNameTooShort
    );
    expect(validateSignupInput({ email: 'valid@example.com', password: '12345678', displayName: 'Alex' })).toBeNull();
  });

  it('validates passkey payloads', () => {
    expect(validatePasskeySigninInput({ email: 'invalid' })).toBe(AUTH_VALIDATION_MESSAGE_KEYS.passkeyEmailRequired);
    expect(validatePasskeySigninInput({ email: 'valid@example.com' })).toBeNull();

    expect(validatePasskeyRegistrationInput({ email: 'invalid', password: '12345678' })).toBe(
      AUTH_VALIDATION_MESSAGE_KEYS.passkeyCredentialsRequired
    );
    expect(validatePasskeyRegistrationInput({ email: 'valid@example.com', password: '' })).toBe(
      AUTH_VALIDATION_MESSAGE_KEYS.passkeyCredentialsRequired
    );
    expect(validatePasskeyRegistrationInput({ email: 'valid@example.com', password: undefined })).toBe(
      AUTH_VALIDATION_MESSAGE_KEYS.passkeyCredentialsRequired
    );
    expect(validatePasskeyRegistrationInput({ email: 'valid@example.com', password: '1234567' })).toBe(
      AUTH_VALIDATION_MESSAGE_KEYS.weakPassword
    );
    expect(validatePasskeyRegistrationInput({ email: 'valid@example.com', password: '12345678' })).toBeNull();
  });
});
