export const LABELS_VALIDATION_MESSAGE_KEYS = {
  noEntitySelected: 'labels_validation_no_entity_selected',
  invalidCopies: 'labels_validation_invalid_copies'
} as const;

export function validateLabelGenerationInput(payload: {
  selectedEntityIds: string[];
  copiesPerEntity: number;
}): (typeof LABELS_VALIDATION_MESSAGE_KEYS)[keyof typeof LABELS_VALIDATION_MESSAGE_KEYS] | null {
  if (payload.selectedEntityIds.length === 0) {
    return LABELS_VALIDATION_MESSAGE_KEYS.noEntitySelected;
  }

  if (!Number.isInteger(payload.copiesPerEntity) || payload.copiesPerEntity < 1) {
    return LABELS_VALIDATION_MESSAGE_KEYS.invalidCopies;
  }

  return null;
}
