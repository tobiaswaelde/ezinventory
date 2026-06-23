import { ConflictException, NotFoundException } from '@nestjs/common';
import { CryptoUtil } from '~/util/crypto';

jest.mock('~/services/s3.service', () => ({
  S3Service: {
    uploadFile: jest.fn(),
    deleteFile: jest.fn(),
  },
}));

jest.mock('sharp', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    resize: jest.fn().mockReturnThis(),
    webp: jest.fn().mockReturnThis(),
    toBuffer: jest.fn(),
  })),
}));

import { UsersService } from '~/modules/users/users.service';

describe('UsersService', () => {
  const createService = () => {
    const tx = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const db = {
      user: {},
      $transaction: jest.fn(async (callback: (trx: typeof tx) => unknown) => callback(tx)),
    };

    return {
      service: new UsersService(db as never),
      tx,
    };
  };

  describe('setPassword', () => {
    it('hashes and stores the new password', async () => {
      const { service, tx } = createService();

      tx.user.findUnique.mockResolvedValue({ id: 'user-1' });
      tx.user.update.mockImplementation(async ({ data }: { data: { password: string } }) => ({
        id: 'user-1',
        password: data.password,
        profile: null,
        preferences: null,
      }));

      const result = await service.setPassword('user-1', { password: 'MySecurePassword123!' });

      expect(tx.user.findUnique).toHaveBeenCalledWith({ where: { id: 'user-1' } });
      expect(tx.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-1' },
          data: expect.objectContaining({
            password: expect.any(String),
            passwordChangedAt: expect.any(Date),
          }),
          include: { profile: true, preferences: true },
        }),
      );
      expect(result.password).not.toBe('MySecurePassword123!');
      await expect(
        CryptoUtil.verifyPassword('MySecurePassword123!', result.password),
      ).resolves.toBe(true);
    });

    it('throws when the user does not exist', async () => {
      const { service, tx } = createService();

      tx.user.findUnique.mockResolvedValue(null);

      await expect(
        service.setPassword('missing-user', { password: 'secret' }),
      ).rejects.toMatchObject({
        constructor: NotFoundException,
        message: 'user/user-not-found',
      });
    });
  });

  describe('disableMfa', () => {
    it('clears the MFA state for an enabled user', async () => {
      const { service, tx } = createService();

      tx.user.findUnique.mockResolvedValue({ isMfaEnabled: true });
      tx.user.update.mockResolvedValue({
        id: 'user-1',
        isMfaEnabled: false,
        mfaSecret: null,
        profile: null,
        preferences: null,
      });

      const result = await service.disableMfa('user-1');

      expect(tx.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: { isMfaEnabled: true },
      });
      expect(tx.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          isMfaEnabled: false,
          mfaSecret: null,
        },
        include: { profile: true, preferences: true },
      });
      expect(result.isMfaEnabled).toBe(false);
      expect(result.mfaSecret).toBeNull();
    });

    it('throws when MFA is already disabled', async () => {
      const { service, tx } = createService();

      tx.user.findUnique.mockResolvedValue({ isMfaEnabled: false });

      await expect(service.disableMfa('user-1')).rejects.toMatchObject({
        constructor: ConflictException,
        message: 'auth/mfa-not-enabled',
      });
    });

    it('throws when the user does not exist', async () => {
      const { service, tx } = createService();

      tx.user.findUnique.mockResolvedValue(null);

      await expect(service.disableMfa('missing-user')).rejects.toMatchObject({
        constructor: NotFoundException,
        message: 'user/user-not-found',
      });
    });
  });
});
