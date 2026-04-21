import { describe, expect, it } from 'vitest';

import {
  LABELS_VALIDATION_MESSAGE_KEYS,
  validateLabelGenerationInput
} from '../../app/utils/labels-validation';

describe('labels validation utilities', () => {
  it('requires at least one selected entity', () => {
    expect(
      validateLabelGenerationInput({
        selectedEntityIds: [],
        copiesPerEntity: 1
      })
    ).toBe(LABELS_VALIDATION_MESSAGE_KEYS.noEntitySelected);
  });

  it('requires integer copies >= 1', () => {
    expect(
      validateLabelGenerationInput({
        selectedEntityIds: ['id-1'],
        copiesPerEntity: 0
      })
    ).toBe(LABELS_VALIDATION_MESSAGE_KEYS.invalidCopies);

    expect(
      validateLabelGenerationInput({
        selectedEntityIds: ['id-1'],
        copiesPerEntity: 1.5
      })
    ).toBe(LABELS_VALIDATION_MESSAGE_KEYS.invalidCopies);
  });

  it('passes valid payload', () => {
    expect(
      validateLabelGenerationInput({
        selectedEntityIds: ['id-1'],
        copiesPerEntity: 2
      })
    ).toBeNull();
  });
});
