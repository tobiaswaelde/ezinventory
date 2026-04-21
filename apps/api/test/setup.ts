import { vi } from 'vitest';

vi.mock('@prisma/client', () => ({
  PrismaClient: class PrismaClient {},
  Prisma: {},
  UserRole: {
    ADMIN: 'ADMIN',
    MANAGER: 'MANAGER',
    STAFF: 'STAFF',
    VIEWER: 'VIEWER'
  },
  IconSet: {
    TABLER: 'TABLER',
    LUCIDE: 'LUCIDE'
  },
  ContainerType: {
    SHELF: 'SHELF',
    BOX: 'BOX',
    FRIDGE: 'FRIDGE',
    BIN: 'BIN',
    CUSTOM: 'CUSTOM'
  },
  PasskeyChallengePurpose: {
    REGISTER: 'REGISTER',
    LOGIN: 'LOGIN'
  }
}));
