export const SETTINGS_VALIDATION_MESSAGE_KEYS = {
  itemCategoryIdInvalid: 'settings_validation_item_category_id_invalid',
  itemSkuRequired: 'settings_validation_item_sku_required',
  itemNameRequired: 'settings_validation_item_name_required',
  itemServingsInvalid: 'settings_validation_item_servings_invalid',
  userDisplayNameTooShort: 'settings_validation_user_display_name_too_short',
  userEmailInvalid: 'settings_validation_user_email_invalid',
  userPasswordTooShort: 'settings_validation_user_password_too_short',
  policyConditionsInvalid: 'settings_validation_policy_conditions_invalid'
} as const;

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type SettingsValidationErrorKey = (typeof SETTINGS_VALIDATION_MESSAGE_KEYS)[keyof typeof SETTINGS_VALIDATION_MESSAGE_KEYS];

export function validateItemInput(payload: {
  categoryId: string;
  sku: string;
  name: string;
  servings?: string;
}): {
  categoryId: SettingsValidationErrorKey | '';
  sku: SettingsValidationErrorKey | '';
  name: SettingsValidationErrorKey | '';
  servings: SettingsValidationErrorKey | '';
} {
  const servingsText = payload.servings?.trim() ?? '';
  const servingsNumber = Number(servingsText);

  return {
    categoryId: UUID_V4_REGEX.test(payload.categoryId)
      ? ''
      : SETTINGS_VALIDATION_MESSAGE_KEYS.itemCategoryIdInvalid,
    sku: payload.sku.trim().length > 0 ? '' : SETTINGS_VALIDATION_MESSAGE_KEYS.itemSkuRequired,
    name: payload.name.trim().length > 0 ? '' : SETTINGS_VALIDATION_MESSAGE_KEYS.itemNameRequired,
    servings:
      servingsText.length === 0 || (Number.isInteger(servingsNumber) && servingsNumber >= 1)
        ? ''
        : SETTINGS_VALIDATION_MESSAGE_KEYS.itemServingsInvalid
  };
}

export function validateManagedUserInput(payload: {
  displayName: string;
  email: string;
  password: string;
}): {
  displayName: SettingsValidationErrorKey | '';
  email: SettingsValidationErrorKey | '';
  password: SettingsValidationErrorKey | '';
} {
  return {
    displayName:
      payload.displayName.trim().length >= 2 ? '' : SETTINGS_VALIDATION_MESSAGE_KEYS.userDisplayNameTooShort,
    email: EMAIL_REGEX.test(payload.email.trim()) ? '' : SETTINGS_VALIDATION_MESSAGE_KEYS.userEmailInvalid,
    password: payload.password.length >= 8 ? '' : SETTINGS_VALIDATION_MESSAGE_KEYS.userPasswordTooShort
  };
}

export function validatePolicyConditionsJson(conditionsJson: string): SettingsValidationErrorKey | '' {
  if (conditionsJson.trim().length === 0) {
    return '';
  }

  try {
    const parsed = JSON.parse(conditionsJson) as unknown;

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return SETTINGS_VALIDATION_MESSAGE_KEYS.policyConditionsInvalid;
    }

    return '';
  } catch {
    return SETTINGS_VALIDATION_MESSAGE_KEYS.policyConditionsInvalid;
  }
}
