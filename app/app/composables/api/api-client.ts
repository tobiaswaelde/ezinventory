import type { CreateItemPayload, ItemResponse } from '~/types/api/items';

export function useApiClient() {
  const baseURL = useRuntimeConfig().public.apiBaseUrl;

  const createItem = async (payload: CreateItemPayload): Promise<ItemResponse> => {
    return await $fetch<ItemResponse>('/items', {
      method: 'POST',
      baseURL,
      body: payload
    });
  };

  const health = async (): Promise<{ status: 'ok' }> => {
    return await $fetch<{ status: 'ok' }>('/health', { baseURL });
  };

  return { createItem, health };
}
