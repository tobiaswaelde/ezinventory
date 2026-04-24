import { CryptoUtil } from '~/util/crypto';

describe('AuthUtil', () => {
  describe('generateSecureToken', () => {
    it('generates a token of the correct length for default 256 bytes', () => {
      const token = CryptoUtil.generateSecureToken();
      // 256 bytes / 32 bytes per UUID segment = 8 segments × 32 hex chars = 256 chars
      expect(token).toHaveLength(256);
    });

    it('generates a token with only hex characters', () => {
      const token = CryptoUtil.generateSecureToken();
      expect(token).toMatch(/^[0-9a-f]+$/);
    });

    it('generates a token of the correct length for 64 bytes', () => {
      const token = CryptoUtil.generateSecureToken(64);
      // 64 / 32 = 2 segments × 32 hex chars = 64 chars
      expect(token).toHaveLength(64);
    });

    it('generates a token of the correct length for 32 bytes', () => {
      const token = CryptoUtil.generateSecureToken(32);
      expect(token).toHaveLength(32);
    });

    it('throws when length is 0', () => {
      expect(() => CryptoUtil.generateSecureToken(0)).toThrow(
        'Length must be a positive number and a multiple of 32.',
      );
    });

    it('throws when length is not a multiple of 32', () => {
      expect(() => CryptoUtil.generateSecureToken(16)).toThrow(
        'Length must be a positive number and a multiple of 32.',
      );
      expect(() => CryptoUtil.generateSecureToken(100)).toThrow(
        'Length must be a positive number and a multiple of 32.',
      );
    });

    it('generates unique tokens', () => {
      const token1 = CryptoUtil.generateSecureToken();
      const token2 = CryptoUtil.generateSecureToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe('encryptPassword / verifyPassword', () => {
    it('encrypts and verifies a password', async () => {
      const password = 'MySecurePassword123!';
      const hash = await CryptoUtil.encryptPassword(password);

      expect(hash).not.toBe(password);
      expect(hash.startsWith('$2')).toBe(true); // bcrypt hash prefix

      const valid = await CryptoUtil.verifyPassword(password, hash);
      expect(valid).toBe(true);
    });

    it('returns false for wrong password', async () => {
      const hash = await CryptoUtil.encryptPassword('correct-password');
      const valid = await CryptoUtil.verifyPassword('wrong-password', hash);
      expect(valid).toBe(false);
    });
  });
});
