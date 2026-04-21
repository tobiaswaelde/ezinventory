import { describe, expect, it } from 'vitest';

import {
  SCAN_VALIDATION_MESSAGE_KEYS,
  validateScannedCodeInput,
  validateStockOutQuantityInput
} from '../../app/utils/scan-validation';

describe('scan validation utilities', () => {
  it('validates scanned code input', () => {
    expect(validateScannedCodeInput('')).toBe(SCAN_VALIDATION_MESSAGE_KEYS.scannedCodeRequired);
    expect(validateScannedCodeInput('   ')).toBe(SCAN_VALIDATION_MESSAGE_KEYS.scannedCodeRequired);
    expect(validateScannedCodeInput('item:123')).toBeNull();
  });

  it('validates stock-out quantity', () => {
    expect(validateStockOutQuantityInput(0)).toBe(SCAN_VALIDATION_MESSAGE_KEYS.quantityInvalid);
    expect(validateStockOutQuantityInput(1.5)).toBe(SCAN_VALIDATION_MESSAGE_KEYS.quantityInvalid);
    expect(validateStockOutQuantityInput(2)).toBeNull();
  });
});
