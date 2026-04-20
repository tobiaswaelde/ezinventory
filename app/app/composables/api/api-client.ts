import type { CreateItemPayload, ItemResponse } from '~/types/api/items';
import type {
  AdminCreatedUser,
  CreateUserByAdminPayload,
  UpdateRegistrationModePayload
} from '~/types/api/setup';

export function useApiClient() {
  const { authorizedFetch } = useAuth();
  const baseURL = useRuntimeConfig().public.apiBaseUrl;

  const createItem = async (payload: CreateItemPayload): Promise<ItemResponse> => {
    return await authorizedFetch<ItemResponse>('/items', {
      method: 'POST',
      body: payload
    });
  };

  const lookupItemByCode = async (code: string): Promise<ItemResponse> => {
    return await authorizedFetch<ItemResponse>('/items/lookup', {
      method: 'GET',
      query: { code }
    });
  };

  const health = async (): Promise<{ status: 'ok' }> => {
    return await $fetch<{ status: 'ok' }>('/health', { baseURL });
  };

  const updateRegistrationMode = async (payload: UpdateRegistrationModePayload): Promise<{ mode: 'OPEN' | 'ADMIN_ONLY' }> => {
    return await authorizedFetch<{ mode: 'OPEN' | 'ADMIN_ONLY' }>('/setup/registration-mode', {
      method: 'PATCH',
      body: payload
    });
  };

  const createUserByAdmin = async (payload: CreateUserByAdminPayload): Promise<AdminCreatedUser> => {
    return await authorizedFetch<AdminCreatedUser>('/setup/users', {
      method: 'POST',
      body: payload
    });
  };

  return { createItem, health, lookupItemByCode, updateRegistrationMode, createUserByAdmin };
}
