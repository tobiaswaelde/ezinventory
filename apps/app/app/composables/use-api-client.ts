import type {
  ApiResponse,
  AdminCreatedUser,
  ContainerResponse,
  CreateContainerPayload,
  CreateItemPayload,
  CreateLocationPayload,
  CreatePermissionPolicyPayload,
  CreateUserByAdminPayload,
  ItemResponse,
  LocationResponse,
  ManagedUser,
  PermissionPolicy,
  ReplaceUserPoliciesResponse,
  RoleBasedUser,
  SetupStatus,
  UserRole,
  UpdateRegistrationModeResponse,
  UpdateRegistrationModePayload
} from '@ezinventory/contracts';

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

  const health = async (): Promise<ApiResponse<'/health', 'get', 200>> => {
    return await $fetch<ApiResponse<'/health', 'get', 200>>('/health', { baseURL });
  };

  const updateRegistrationMode = async (payload: UpdateRegistrationModePayload): Promise<UpdateRegistrationModeResponse> => {
    return await authorizedFetch<UpdateRegistrationModeResponse>('/setup/registration-mode', {
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

  const listUsers = async (query?: {
    fields?: string;
    search?: string;
    role?: UserRole;
    sortBy?: 'displayName' | 'email' | 'createdAt' | 'updatedAt' | 'role';
    sortDir?: 'asc' | 'desc';
  }): Promise<ManagedUser[]> => {
    return await authorizedFetch<ManagedUser[]>('/setup/users', {
      method: 'GET',
      query
    });
  };

  const updateUserRole = async (userId: string, role: ManagedUser['role']): Promise<RoleBasedUser> => {
    return await authorizedFetch<RoleBasedUser>(`/setup/users/${userId}/role`, {
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

  const replaceUserPolicies = async (userId: string, policyIds: string[]): Promise<ReplaceUserPoliciesResponse> => {
    return await authorizedFetch<ReplaceUserPoliciesResponse>(`/setup/users/${userId}/policies`, {
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
