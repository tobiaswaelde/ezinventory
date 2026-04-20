export type AuthUser = {
  id: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'STAFF' | 'VIEWER';
  preferredLanguage: 'de' | 'en';
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  displayName: string;
  preferredLanguage?: 'de' | 'en';
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  email: string;
};
