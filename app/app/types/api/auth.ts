export type AuthUser = {
  id: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'STAFF' | 'VIEWER';
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  email: string;
};
