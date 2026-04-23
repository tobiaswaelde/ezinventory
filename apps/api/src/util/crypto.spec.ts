import { AuthUtil } from '~/util/crypto';

describe('AuthUtil', () => {
  describe('generateSecureToken', () => {
    it('generates a token of the correct length for default 256 bytes', () => {
      const token = AuthUtil.generateSecureToken();
      // 256 bytes / 32 bytes per UUID segment = 8 segments × 32 hex chars = 256 chars
      expect(token).toHaveLength(256);
    });

    it('generates a token with only hex characters', () => {
      const token = AuthUtil.generateSecureToken();
      expect(token).toMatch(/^[0-9a-f]+$/);
    });

    it('generates a token of the correct length for 64 bytes', () => {
      const token = AuthUtil.generateSecureToken(64);
      // 64 / 32 = 2 segments × 32 hex chars = 64 chars
      expect(token).toHaveLength(64);
    });

    it('generates a token of the correct length for 32 bytes', () => {
      const token = AuthUtil.generateSecureToken(32);
      expect(token).toHaveLength(32);
    });

    it('throws when length is 0', () => {
      expect(() => AuthUtil.generateSecureToken(0)).toThrow(
        'Length must be a positive number and a multiple of 32.',
      );
    });

    it('throws when length is not a multiple of 32', () => {
      expect(() => AuthUtil.generateSecureToken(16)).toThrow(
        'Length must be a positive number and a multiple of 32.',
      );
      expect(() => AuthUtil.generateSecureToken(100)).toThrow(
        'Length must be a positive number and a multiple of 32.',
      );
    });

    it('generates unique tokens', () => {
      const token1 = AuthUtil.generateSecureToken();
      const token2 = AuthUtil.generateSecureToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe('encryptPassword / verifyPassword', () => {
    it('encrypts and verifies a password', async () => {
      const password = 'MySecurePassword123!';
      const hash = await AuthUtil.encryptPassword(password);

      expect(hash).not.toBe(password);
      expect(hash.startsWith('$2')).toBe(true); // bcrypt hash prefix

      const valid = await AuthUtil.verifyPassword(password, hash);
      expect(valid).toBe(true);
    });

    it('returns false for wrong password', async () => {
      const hash = await AuthUtil.encryptPassword('correct-password');
      const valid = await AuthUtil.verifyPassword('wrong-password', hash);
      expect(valid).toBe(false);
    });
  });
});
