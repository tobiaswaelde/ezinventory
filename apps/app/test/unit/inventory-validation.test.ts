import { describe, expect, it } from 'vitest';

import {
  INVENTORY_VALIDATION_MESSAGE_KEYS,
  validateContainerInput,
  validateInventoryCode,
  validateLocationInput
} from '../../app/utils/inventory-validation';

describe('inventory validation utilities', () => {
  it('validates inventory code pattern', () => {
    expect(validateInventoryCode('MAIN-SHELF-01')).toBe('');
    expect(validateInventoryCode('x')).toBe(INVENTORY_VALIDATION_MESSAGE_KEYS.codePatternInvalid);
    expect(validateInventoryCode('not allowed space')).toBe(INVENTORY_VALIDATION_MESSAGE_KEYS.codePatternInvalid);
  });

  it('validates location form payload', () => {
    expect(
      validateLocationInput({
        name: '',
        code: 'bad code'
      })
    ).toEqual({
      name: INVENTORY_VALIDATION_MESSAGE_KEYS.locationNameRequired,
      code: INVENTORY_VALIDATION_MESSAGE_KEYS.codePatternInvalid
    });

    expect(
      validateLocationInput({
        name: 'Garage',
        code: 'GARAGE-1'
      })
    ).toEqual({
      name: '',
      code: ''
    });
  });

  it('validates container form payload', () => {
    expect(
      validateContainerInput({
        locationId: '',
        name: '',
        code: 'box one'
      })
    ).toEqual({
      locationId: INVENTORY_VALIDATION_MESSAGE_KEYS.locationRequired,
      name: INVENTORY_VALIDATION_MESSAGE_KEYS.locationNameRequired,
      code: INVENTORY_VALIDATION_MESSAGE_KEYS.codePatternInvalid
    });

    expect(
      validateContainerInput({
        locationId: 'loc-1',
        name: 'Freezer Drawer 1',
        code: 'FREEZER-DRAWER-1'
      })
    ).toEqual({
      locationId: '',
      name: '',
      code: ''
    });
  });
});
