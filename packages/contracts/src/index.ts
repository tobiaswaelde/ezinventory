import type { paths } from './generated/openapi';

type JsonRequestBody<T> = T extends { requestBody?: infer B }
  ? [B] extends [never]
    ? Record<string, unknown>
    : B extends { content: { 'application/json': infer R } }
      ? R
      : Record<string, unknown>
  : Record<string, unknown>;
type JsonResponse<T, C extends number> = T extends { responses: Record<C, { content: { 'application/json': infer R } }> } ? R : never;
type Operation<P extends keyof paths, M extends keyof paths[P]> = paths[P][M];
type Defined<T> = T extends (infer U)[] ? Defined<U>[] : T extends object ? { [K in keyof T]-?: Defined<Exclude<T[K], undefined>> } : Exclude<T, undefined>;
type DefinedJsonResponse<T, C extends number> = Defined<JsonResponse<T, C>>;

export type UserRole = 'ADMIN' | 'MANAGER' | 'STAFF' | 'VIEWER';

export type LoginPayload = JsonRequestBody<Operation<'/api/v1/auth/login', 'post'>>;
export type RegisterPayload = JsonRequestBody<Operation<'/api/v1/auth/register', 'post'>>;
export type AuthTokens = DefinedJsonResponse<Operation<'/api/v1/auth/login', 'post'>, 200>;
export type AuthUser = DefinedJsonResponse<Operation<'/api/v1/auth/me', 'get'>, 200>;

export type IconSet = 'TABLER' | 'LUCIDE';
export type ContainerType = 'SHELF' | 'BOX' | 'FRIDGE' | 'BIN' | 'CUSTOM';

export type CreateLocationPayload = JsonRequestBody<Operation<'/api/v1/locations', 'post'>>;
export type LocationResponse = DefinedJsonResponse<Operation<'/api/v1/locations', 'post'>, 201>;
export type CreateContainerPayload = JsonRequestBody<Operation<'/api/v1/containers', 'post'>>;
export type ContainerResponse = DefinedJsonResponse<Operation<'/api/v1/containers', 'post'>, 201>;

export type CreateItemPayload = JsonRequestBody<Operation<'/api/v1/items', 'post'>>;
export type ItemResponse = DefinedJsonResponse<Operation<'/api/v1/items', 'post'>, 201>;

export type RegistrationMode = 'OPEN' | 'ADMIN_ONLY';
export type CaslAction = 'manage' | 'create' | 'read' | 'update' | 'delete' | 'scan' | 'stock-out';
export type CaslSubject = 'all' | 'Auth' | 'Category' | 'Item' | 'Location' | 'Container' | 'Stock' | 'User';

export type UpdateRegistrationModePayload = JsonRequestBody<Operation<'/api/v1/setup/registration-mode', 'patch'>>;
export type SetupStatus = DefinedJsonResponse<Operation<'/api/v1/setup/status', 'get'>, 200>;
export type CreateUserByAdminPayload = JsonRequestBody<Operation<'/api/v1/setup/users', 'post'>>;
export type AdminCreatedUser = DefinedJsonResponse<Operation<'/api/v1/setup/users', 'post'>, 200>;
type ManagedUsersResponse = DefinedJsonResponse<Operation<'/api/v1/setup/users', 'get'>, 200>;
type PermissionPoliciesResponse = DefinedJsonResponse<Operation<'/api/v1/setup/permission-policies', 'get'>, 200>;
export type ManagedUser = ManagedUsersResponse[number];
export type PermissionPolicy = PermissionPoliciesResponse[number];
export type CreatePermissionPolicyPayload = JsonRequestBody<Operation<'/api/v1/setup/permission-policies', 'post'>>;

export type PasskeyRegisterOptionsPayload = JsonRequestBody<Operation<'/api/v1/auth/passkeys/register-options', 'post'>>;
export type PasskeyRegisterOptionsResponse = DefinedJsonResponse<Operation<'/api/v1/auth/passkeys/register-options', 'post'>, 200>;
export type PasskeyRegisterVerifyPayload = JsonRequestBody<Operation<'/api/v1/auth/passkeys/register-verify', 'post'>>;
export type PasskeyRegisterVerifyResponse = DefinedJsonResponse<Operation<'/api/v1/auth/passkeys/register-verify', 'post'>, 201>;
export type PasskeyLoginOptionsPayload = JsonRequestBody<Operation<'/api/v1/auth/passkeys/login-options', 'post'>>;
export type PasskeyLoginOptionsResponse = DefinedJsonResponse<Operation<'/api/v1/auth/passkeys/login-options', 'post'>, 200>;
export type PasskeyLoginVerifyPayload = JsonRequestBody<Operation<'/api/v1/auth/passkeys/login-verify', 'post'>>;
export type PasskeyLoginVerifyResponse = DefinedJsonResponse<Operation<'/api/v1/auth/passkeys/login-verify', 'post'>, 200>;

export type RefreshTokenPayload = JsonRequestBody<Operation<'/api/v1/auth/refresh', 'post'>>;
export type UpdatePreferredLanguagePayload = JsonRequestBody<Operation<'/api/v1/auth/me/language', 'patch'>>;
export type UpdatePreferredLanguageResponse = DefinedJsonResponse<Operation<'/api/v1/auth/me/language', 'patch'>, 200>;

export type RoleBasedUser = {
  id: string;
  role: UserRole;
};

export type ReplaceUserPoliciesResponse = DefinedJsonResponse<Operation<'/api/v1/setup/users/{userId}/policies', 'put'>, 200>;
