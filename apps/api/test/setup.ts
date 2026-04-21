import { vi } from 'vitest';

vi.mock('@prisma/client', () => {
  const mock = {
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
    AttachmentOwnerType: {
      ITEM: 'ITEM',
      LOCATION: 'LOCATION',
      CONTAINER: 'CONTAINER'
    },
    PasskeyChallengePurpose: {
      REGISTER: 'REGISTER',
      LOGIN: 'LOGIN'
    }
  };

  return {
    ...mock,
    default: mock
  };
});
