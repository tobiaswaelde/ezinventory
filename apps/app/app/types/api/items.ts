export interface CreateItemPayload {
  categoryId: string;
  sku: string;
  name: string;
  unit?: string;
  sizeLabel?: string;
  sizeValue?: number;
  sizeUnit?: string;
  servings?: number;
}

export interface ItemResponse {
  id: string;
  categoryId: string;
  sku: string;
  qrCodeValue: string;
  name: string;
  unit: string;
  sizeLabel: string | null;
  sizeValue: number | null;
  sizeUnit: string | null;
  servings: number | null;
}
