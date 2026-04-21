export const SCAN_VALIDATION_MESSAGE_KEYS = {
  scannedCodeRequired: 'scan_validation_code_required',
  quantityInvalid: 'scan_validation_quantity_invalid',
  noScannedItem: 'scan_validation_no_scanned_item'
} as const;

export function validateScannedCodeInput(code: string): (typeof SCAN_VALIDATION_MESSAGE_KEYS)[keyof typeof SCAN_VALIDATION_MESSAGE_KEYS] | null {
  if (!code.trim()) {
    return SCAN_VALIDATION_MESSAGE_KEYS.scannedCodeRequired;
  }

  return null;
}

export function validateStockOutQuantityInput(value: number): (typeof SCAN_VALIDATION_MESSAGE_KEYS)[keyof typeof SCAN_VALIDATION_MESSAGE_KEYS] | null {
  if (!Number.isInteger(value) || value < 1) {
    return SCAN_VALIDATION_MESSAGE_KEYS.quantityInvalid;
  }

  return null;
}
