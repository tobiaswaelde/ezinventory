export interface CreateItemPayload {
  categoryId: string;
  sku: string;
  name: string;
  servings?: number;
}

export interface ItemResponse extends CreateItemPayload {
  id: string;
}
