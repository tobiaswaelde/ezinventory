import type { CreateItemPayload, ItemResponse } from '~/types/api/items';
import type {
  ContainerResponse,
  CreateContainerPayload,
  CreateLocationPayload,
  LocationResponse
} from '~/types/api/inventory';
import type {
  AdminCreatedUser,
  CreatePermissionPolicyPayload,
  CreateUserByAdminPayload,
  ManagedUser,
  PermissionPolicy,
  SetupStatus,
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

  const listItems = async (): Promise<ItemResponse[]> => {
    return await authorizedFetch<ItemResponse[]>('/items', {
      method: 'GET'
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

  const getSetupStatus = async (): Promise<SetupStatus> => {
    return await $fetch<SetupStatus>('/setup/status', { baseURL });
  };

  const createUserByAdmin = async (payload: CreateUserByAdminPayload): Promise<AdminCreatedUser> => {
    return await authorizedFetch<AdminCreatedUser>('/setup/users', {
      method: 'POST',
      body: payload
    });
  };

  const listUsers = async (): Promise<ManagedUser[]> => {
    return await authorizedFetch<ManagedUser[]>('/setup/users', {
      method: 'GET'
    });
  };

  const updateUserRole = async (userId: string, role: ManagedUser['role']): Promise<{ id: string; role: ManagedUser['role'] }> => {
    return await authorizedFetch<{ id: string; role: ManagedUser['role'] }>(`/setup/users/${userId}/role`, {
      method: 'PATCH',
      body: { role }
    });
  };

  const listPermissionPolicies = async (): Promise<PermissionPolicy[]> => {
    return await authorizedFetch<PermissionPolicy[]>('/setup/permission-policies', {
      method: 'GET'
    });
  };

  const createPermissionPolicy = async (payload: CreatePermissionPolicyPayload): Promise<PermissionPolicy> => {
    return await authorizedFetch<PermissionPolicy>('/setup/permission-policies', {
      method: 'POST',
      body: payload
    });
  };

  const replaceUserPolicies = async (userId: string, policyIds: string[]): Promise<{ userId: string; policyIds: string[] }> => {
    return await authorizedFetch<{ userId: string; policyIds: string[] }>(`/setup/users/${userId}/policies`, {
      method: 'PUT',
      body: { policyIds }
    });
  };

  return {
    createContainer,
    createItem,
    createLocation,
    createPermissionPolicy,
    createUserByAdmin,
    getSetupStatus,
    health,
    listContainers,
    listItems,
    listLocations,
    listPermissionPolicies,
    listUsers,
    lookupItemByCode,
    replaceUserPolicies,
    updateUserRole,
    updateRegistrationMode
  };
}
