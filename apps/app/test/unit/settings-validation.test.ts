import { describe, expect, it } from 'vitest';

import {
  SETTINGS_VALIDATION_MESSAGE_KEYS,
  validateItemInput,
  validateManagedUserInput,
  validatePolicyConditionsJson
} from '../../app/utils/settings-validation';

describe('settings validation utilities', () => {
  it('validates item payload', () => {
    expect(
      validateItemInput({
        categoryId: 'not-a-uuid',
        sku: '',
        name: '',
        servings: '0'
      })
    ).toEqual({
      categoryId: SETTINGS_VALIDATION_MESSAGE_KEYS.itemCategoryIdInvalid,
      sku: SETTINGS_VALIDATION_MESSAGE_KEYS.itemSkuRequired,
      name: SETTINGS_VALIDATION_MESSAGE_KEYS.itemNameRequired,
      servings: SETTINGS_VALIDATION_MESSAGE_KEYS.itemServingsInvalid
    });

    expect(
      validateItemInput({
        categoryId: '550e8400-e29b-41d4-a716-446655440001',
        sku: 'SKU-1',
        name: 'Item',
        servings: '2'
      })
    ).toEqual({
      categoryId: '',
      sku: '',
      name: '',
      servings: ''
    });
  });

  it('validates managed user payload', () => {
    expect(
      validateManagedUserInput({
        displayName: 'A',
        email: 'nope',
        password: 'short'
      })
    ).toEqual({
      displayName: SETTINGS_VALIDATION_MESSAGE_KEYS.userDisplayNameTooShort,
      email: SETTINGS_VALIDATION_MESSAGE_KEYS.userEmailInvalid,
      password: SETTINGS_VALIDATION_MESSAGE_KEYS.userPasswordTooShort
    });

    expect(
      validateManagedUserInput({
        displayName: 'Alex',
        email: 'alex@example.com',
        password: '12345678'
      })
    ).toEqual({
      displayName: '',
      email: '',
      password: ''
    });
  });

  it('validates policy conditions json', () => {
    expect(validatePolicyConditionsJson('')).toBe('');
    expect(validatePolicyConditionsJson('{"id":{"$eq":"x"}}')).toBe('');
    expect(validatePolicyConditionsJson('[]')).toBe(SETTINGS_VALIDATION_MESSAGE_KEYS.policyConditionsInvalid);
    expect(validatePolicyConditionsJson('{invalid')).toBe(SETTINGS_VALIDATION_MESSAGE_KEYS.policyConditionsInvalid);
  });
});
