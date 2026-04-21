import type { paths } from './generated/openapi';

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';
type SuccessStatusCode = 200 | 201 | 202 | 204;
type ApiVersionPrefix = '/api/v1';

type WithApiPrefix<P extends string> = P extends `${ApiVersionPrefix}${string}` ? P : `${ApiVersionPrefix}${P}`;
type ApiPath<P extends string> = WithApiPrefix<P> & keyof paths;
type ApiMethodForPath<P extends string> = Extract<keyof paths[ApiPath<P>], HttpMethod>;
type Operation<P extends string, M extends ApiMethodForPath<P>> = paths[ApiPath<P>][M];

type JsonRequestBody<T> = T extends { requestBody?: { content: { 'application/json': infer R } } } ? R : never;
type JsonResponse<T, C extends number> = T extends { responses: Record<C, { content: { 'application/json': infer R } }> } ? R : never;
type JsonSuccessResponse<T> = T extends { responses: infer R }
  ? {
      [K in Extract<keyof R, SuccessStatusCode>]: R[K] extends { content: { 'application/json': infer Body } } ? Body : never;
    }[Extract<keyof R, SuccessStatusCode>]
  : never;

type OperationParameters<T> = T extends { parameters: infer P } ? P : never;

export type ApiRequest<P extends string, M extends ApiMethodForPath<P>> = JsonRequestBody<Operation<P, M>>;
export type ApiResponse<P extends string, M extends ApiMethodForPath<P>, C extends number | undefined = undefined> = C extends number
  ? JsonResponse<Operation<P, M>, C>
  : JsonSuccessResponse<Operation<P, M>>;
export type ApiQuery<P extends string, M extends ApiMethodForPath<P>> = OperationParameters<Operation<P, M>> extends { query?: infer Q } ? Q : never;
export type ApiPathParams<P extends string, M extends ApiMethodForPath<P>> = OperationParameters<Operation<P, M>> extends { path?: infer Params } ? Params : never;
export type ApiMethods<P extends string> = ApiMethodForPath<P>;

export type UserRole = 'ADMIN' | 'MANAGER' | 'STAFF' | 'VIEWER';

export type LoginPayload = ApiRequest<'/auth/login', 'post'>;
export type RegisterPayload = ApiRequest<'/auth/register', 'post'>;
export type AuthTokens = ApiResponse<'/auth/login', 'post', 200>;
export type AuthUser = ApiResponse<'/auth/me', 'get', 200>;
export type HealthResponse = ApiResponse<'/health', 'get', 200>;
export type LogoutPayload = ApiRequest<'/auth/logout', 'post'>;
export type LogoutResponse = ApiResponse<'/auth/logout', 'post', 200>;

export type IconSet = 'TABLER' | 'LUCIDE';
export type ContainerType = 'SHELF' | 'BOX' | 'FRIDGE' | 'BIN' | 'CUSTOM';

export type CreateLocationPayload = ApiRequest<'/locations', 'post'>;
export type LocationResponse = ApiResponse<'/locations', 'post', 201>;
export type CreateContainerPayload = ApiRequest<'/containers', 'post'>;
export type ContainerResponse = ApiResponse<'/containers', 'post', 201>;

export type CreateItemPayload = ApiRequest<'/items', 'post'>;
export type ItemResponse = ApiResponse<'/items', 'post', 201>;

export type RegistrationMode = 'OPEN' | 'ADMIN_ONLY';
export type CaslAction = 'manage' | 'create' | 'read' | 'update' | 'delete' | 'scan' | 'stock-out';
export type CaslSubject = 'all' | 'Auth' | 'Category' | 'Item' | 'Location' | 'Container' | 'Stock' | 'User';

export type UpdateRegistrationModePayload = ApiRequest<'/setup/registration-mode', 'patch'>;
export type UpdateRegistrationModeResponse = ApiResponse<'/setup/registration-mode', 'patch', 200>;
export type SetupStatus = ApiResponse<'/setup/status', 'get', 200>;
export type CreateUserByAdminPayload = ApiRequest<'/setup/users', 'post'>;
export type AdminCreatedUser = ApiResponse<'/setup/users', 'post', 200>;
export type ManagedUser = ApiResponse<'/setup/users', 'get', 200>[number];
export type PermissionPolicy = ApiResponse<'/setup/permission-policies', 'get', 200>[number];
export type CreatePermissionPolicyPayload = ApiRequest<'/setup/permission-policies', 'post'>;

export type PasskeyRegisterOptionsPayload = ApiRequest<'/auth/passkeys/register-options', 'post'>;
export type PasskeyRegisterOptionsResponse = ApiResponse<'/auth/passkeys/register-options', 'post', 200>;
export type PasskeyRegisterVerifyPayload = ApiRequest<'/auth/passkeys/register-verify', 'post'>;
export type PasskeyRegisterVerifyResponse = ApiResponse<'/auth/passkeys/register-verify', 'post', 201>;
export type PasskeyLoginOptionsPayload = ApiRequest<'/auth/passkeys/login-options', 'post'>;
export type PasskeyLoginOptionsResponse = ApiResponse<'/auth/passkeys/login-options', 'post', 200>;
export type PasskeyLoginVerifyPayload = ApiRequest<'/auth/passkeys/login-verify', 'post'>;
export type PasskeyLoginVerifyResponse = ApiResponse<'/auth/passkeys/login-verify', 'post', 200>;

export type RefreshTokenPayload = ApiRequest<'/auth/refresh', 'post'>;
export type UpdatePreferredLanguagePayload = ApiRequest<'/auth/me/language', 'patch'>;
export type UpdatePreferredLanguageResponse = ApiResponse<'/auth/me/language', 'patch', 200>;

export type RoleBasedUser = {
  id: string;
  role: UserRole;
};

export type ReplaceUserPoliciesResponse = ApiResponse<'/setup/users/{userId}/policies', 'put', 200>;
