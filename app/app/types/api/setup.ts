export type RegistrationMode = 'OPEN' | 'ADMIN_ONLY';

export type UpdateRegistrationModePayload = {
  mode: RegistrationMode;
};

export type CreateUserByAdminPayload = {
  email: string;
  password: string;
  displayName: string;
  role: 'ADMIN' | 'MANAGER' | 'STAFF' | 'VIEWER';
  preferredLanguage?: 'de' | 'en';
};

export type AdminCreatedUser = {
  id: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'STAFF' | 'VIEWER';
};
