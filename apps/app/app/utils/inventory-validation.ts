export const INVENTORY_VALIDATION_MESSAGE_KEYS = {
  locationNameRequired: 'inventory_error_location_name_required',
  locationRequired: 'inventory_error_location_required',
  codePatternInvalid: 'inventory_error_code_pattern'
} as const;

const CODE_PATTERN = /^[A-Z0-9-]{2,40}$/;

export type InventoryValidationErrorKey =
  (typeof INVENTORY_VALIDATION_MESSAGE_KEYS)[keyof typeof INVENTORY_VALIDATION_MESSAGE_KEYS];

export function validateInventoryCode(code: string): InventoryValidationErrorKey | '' {
  return CODE_PATTERN.test(code.trim().toUpperCase())
    ? ''
    : INVENTORY_VALIDATION_MESSAGE_KEYS.codePatternInvalid;
}

export function validateLocationInput(payload: {
  name: string;
  code: string;
}): {
  name: InventoryValidationErrorKey | '';
  code: InventoryValidationErrorKey | '';
} {
  return {
    name:
      payload.name.trim().length > 0
        ? ''
        : INVENTORY_VALIDATION_MESSAGE_KEYS.locationNameRequired,
    code: validateInventoryCode(payload.code)
  };
}

export function validateContainerInput(payload: {
  locationId: string;
  name: string;
  code: string;
}): {
  locationId: InventoryValidationErrorKey | '';
  name: InventoryValidationErrorKey | '';
  code: InventoryValidationErrorKey | '';
} {
  return {
    locationId:
      payload.locationId.trim().length > 0
        ? ''
        : INVENTORY_VALIDATION_MESSAGE_KEYS.locationRequired,
    name:
      payload.name.trim().length > 0
        ? ''
        : INVENTORY_VALIDATION_MESSAGE_KEYS.locationNameRequired,
    code: validateInventoryCode(payload.code)
  };
}
