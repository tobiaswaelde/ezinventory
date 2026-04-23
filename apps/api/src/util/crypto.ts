import * as bcrypt from 'bcrypt';
import { ENV } from '~/config/env';

/**
 * Utility class for authentication-related operations.
 */
export class AuthUtil {
  /**
   * Encrypt password using bcrypt.
   * @param {string} password The password to encrypt.
   * @returns {string} The encrypted password.
   */
  public static async encryptPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(ENV.AUTH_BCRYPT_ROUNDS);
    return bcrypt.hash(password, salt);
  }

  /**
   * Verify password using bcrypt.
   * @param {string} password The password to verify.
   * @param {string} hash The hash of the password to verify.
   * @returns {boolean} `true` if the passwort is valid.
   */
  public static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate a secure random token.
   * @param {number} length Length of the token in bytes. Default is 256 bytes.
   * @returns {string} The generated secure token as a hexadecimal string.
   * @throws {Error} If length is not a positive number and a multiple of 32.
   */
  public static generateSecureToken(length: number = 256): string {
    // validate length
    if (length <= 0 || length % 32 !== 0) {
      throw new Error('Length must be a positive number and a multiple of 32.');
    }

    // calculate number of segments (32 bytes per segment)
    const segments = length / 32;

    // generate token
    let token = '';
    for (let i = 0; i < segments; i++) {
      token += crypto.randomUUID().replace(/-/g, '');
    }
    return token;
  }
}
