export type RegistrationMode = 'OPEN' | 'ADMIN_ONLY';
export type UserRole = 'ADMIN' | 'MANAGER' | 'STAFF' | 'VIEWER';
export type CaslAction = 'manage' | 'create' | 'read' | 'update' | 'delete' | 'scan' | 'stock-out';
export type CaslSubject = 'all' | 'Auth' | 'Category' | 'Item' | 'Location' | 'Container' | 'Stock' | 'User';

export type UpdateRegistrationModePayload = {
  mode: RegistrationMode;
};

export type SetupStatus = {
  setupInitialized: boolean;
  registrationMode: RegistrationMode;
};

export type CreateUserByAdminPayload = {
  email: string;
  password: string;
  displayName: string;
  role: UserRole;
  preferredLanguage?: 'de' | 'en';
};

export type AdminCreatedUser = {
  id: string;
  email: string;
  role: UserRole;
};

export type ManagedUser = {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  preferredLanguage: string;
  createdAt: string;
  updatedAt: string;
  policyIds: string[];
};

export type PermissionPolicy = {
  id: string;
  action: CaslAction;
  subject: CaslSubject;
  inverted: boolean;
  conditions: unknown;
  reason: string | null;
  createdAt: string;
};

export type CreatePermissionPolicyPayload = {
  action: CaslAction;
  subject: CaslSubject;
  inverted?: boolean;
  reason?: string;
  conditions?: Record<string, unknown>;
};
