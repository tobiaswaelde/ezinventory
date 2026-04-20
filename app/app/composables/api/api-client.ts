import type { CreateItemPayload, ItemResponse } from '~/types/api/items';
import type {
  ContainerResponse,
  CreateContainerPayload,
  CreateLocationPayload,
  LocationResponse
} from '~/types/api/inventory';
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

  const createLocation = async (payload: CreateLocationPayload): Promise<LocationResponse> => {
    return await authorizedFetch<LocationResponse>('/locations', {
      method: 'POST',
      body: payload
    });
  };

  const listLocations = async (): Promise<LocationResponse[]> => {
    return await authorizedFetch<LocationResponse[]>('/locations', {
      method: 'GET'
    });
  };

  const createContainer = async (payload: CreateContainerPayload): Promise<ContainerResponse> => {
    return await authorizedFetch<ContainerResponse>('/containers', {
      method: 'POST',
      body: payload
    });
  };

  const listContainers = async (locationId?: string): Promise<ContainerResponse[]> => {
    return await authorizedFetch<ContainerResponse[]>('/containers', {
      method: 'GET',
      query: locationId ? { locationId } : undefined
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

  return {
    createContainer,
    createItem,
    createLocation,
    createUserByAdmin,
    health,
    listContainers,
    listLocations,
    lookupItemByCode,
    updateRegistrationMode
  };
}
