/**
 * API Tags for Swagger documentation & controller prefixing
 */
export enum ApiTag {
  Health = 'health',
  Auth = 'auth',
  AuthPassword = 'auth/password',
  AuthMfa = 'auth/mfa',
  Users = 'users',
  UsersMe = 'users/me',
}

/**
 * API Authentication methods for Swagger documentation
 */
export enum ApiAuth {
  JWT = 'jwt',
}
