import type { paths } from './generated/openapi';

type JsonRequestBody<T> = T extends { requestBody?: { content: { 'application/json': infer R } } } ? R : never;
type JsonResponse<T, C extends number> = T extends { responses: Record<C, { content: { 'application/json': infer R } }> } ? R : never;
type Operation<P extends keyof paths, M extends keyof paths[P]> = paths[P][M];

type UserRole = 'ADMIN' | 'MANAGER' | 'STAFF' | 'VIEWER';

export type LoginPayload = JsonRequestBody<Operation<'/auth/login', 'post'>>;
export type RegisterPayload = JsonRequestBody<Operation<'/auth/register', 'post'>>;
export type AuthTokens = JsonResponse<Operation<'/auth/login', 'post'>, 200>;
export type AuthUser = JsonResponse<Operation<'/auth/me', 'get'>, 200>;

export type IconSet = 'TABLER' | 'LUCIDE';
export type ContainerType = 'SHELF' | 'BOX' | 'FRIDGE' | 'BIN' | 'CUSTOM';

export type CreateLocationPayload = JsonRequestBody<Operation<'/locations', 'post'>>;
export type LocationResponse = JsonResponse<Operation<'/locations', 'post'>, 201>;
export type CreateContainerPayload = JsonRequestBody<Operation<'/containers', 'post'>>;
export type ContainerResponse = JsonResponse<Operation<'/containers', 'post'>, 201>;

export type CreateItemPayload = JsonRequestBody<Operation<'/items', 'post'>>;
export type ItemResponse = JsonResponse<Operation<'/items', 'post'>, 201>;

export type RegistrationMode = 'OPEN' | 'ADMIN_ONLY';
export type CaslAction = 'manage' | 'create' | 'read' | 'update' | 'delete' | 'scan' | 'stock-out';
export type CaslSubject = 'all' | 'Auth' | 'Category' | 'Item' | 'Location' | 'Container' | 'Stock' | 'User';

export type UpdateRegistrationModePayload = JsonRequestBody<Operation<'/setup/registration-mode', 'patch'>>;
export type SetupStatus = JsonResponse<Operation<'/setup/status', 'get'>, 200>;
export type CreateUserByAdminPayload = JsonRequestBody<Operation<'/setup/users', 'post'>>;
export type AdminCreatedUser = JsonResponse<Operation<'/setup/users', 'post'>, 200>;
export type ManagedUser = JsonResponse<Operation<'/setup/users', 'get'>, 200>[number];
export type PermissionPolicy = JsonResponse<Operation<'/setup/permission-policies', 'get'>, 200>[number];
export type CreatePermissionPolicyPayload = JsonRequestBody<Operation<'/setup/permission-policies', 'post'>>;

export type PasskeyRegisterOptionsPayload = JsonRequestBody<Operation<'/auth/passkeys/register-options', 'post'>>;
export type PasskeyRegisterOptionsResponse = JsonResponse<Operation<'/auth/passkeys/register-options', 'post'>, 200>;
export type PasskeyRegisterVerifyPayload = JsonRequestBody<Operation<'/auth/passkeys/register-verify', 'post'>>;
export type PasskeyRegisterVerifyResponse = JsonResponse<Operation<'/auth/passkeys/register-verify', 'post'>, 201>;
export type PasskeyLoginOptionsPayload = JsonRequestBody<Operation<'/auth/passkeys/login-options', 'post'>>;
export type PasskeyLoginOptionsResponse = JsonResponse<Operation<'/auth/passkeys/login-options', 'post'>, 200>;
export type PasskeyLoginVerifyPayload = JsonRequestBody<Operation<'/auth/passkeys/login-verify', 'post'>>;
export type PasskeyLoginVerifyResponse = JsonResponse<Operation<'/auth/passkeys/login-verify', 'post'>, 200>;

export type RefreshTokenPayload = JsonRequestBody<Operation<'/auth/refresh', 'post'>>;
export type UpdatePreferredLanguagePayload = JsonRequestBody<Operation<'/auth/me/language', 'patch'>>;
export type UpdatePreferredLanguageResponse = JsonResponse<Operation<'/auth/me/language', 'patch'>, 200>;

export type RoleBasedUser = {
  id: string;
  role: UserRole;
};

export type ReplaceUserPoliciesResponse = JsonResponse<Operation<'/setup/users/{userId}/policies', 'put'>, 200>;
