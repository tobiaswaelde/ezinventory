import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as otplib from 'otplib';
import * as qrcode from 'qrcode';
import { ENV } from '~/config/env';
import { PrismaService } from '~/prisma/prisma.service';
import { ErrorCode } from '~/types/error-code';
import { MfaEnableDTO } from '~/types/modules/auth/mfa/mfa-enable.dto';
import { MfaVerifyDTO } from '~/types/modules/auth/mfa/mfa-verify.dto';
import { UserPayload } from '~/types/modules/user';

@Injectable()
export class MfaService {
  public static readonly token = 'MFA_SERVICE';

  constructor(protected readonly db: PrismaService) {}

  /**
   * Check if OTP is valid
   * @param {string} token The token to check
   * @param {string} secret The secret to verify against
   * @returns {boolean} `true` if the token is valid, `false` otherwise
   */
  public async verifyToken(token: string, secret: string): Promise<boolean> {
    const result = await otplib.verify({ token, secret, epochTolerance: 30 });
    return result.valid;
  }

  /**
   * Request MFA secret & QR code for setup
   * @param {string} userId The ID of the user
   * @returns {{secret: string; dataUrl: string; otpauth: string}} The MFA secret, QR code as data URL, and otpauth URI
   * @throws {NotFoundException} ErrorCode.UserNotFound
   * @throws {ConflictException} ErrorCode.AuthMfaAlreadyEnabled
   */
  public async requestMfa(userId: string) {
    // find user by ID
    const user = await this.db.user.findUnique({
      where: { id: userId },
      select: { mfaSecret: true, isMfaEnabled: true, email: true },
    });

    // check if MFA can be enabled
    if (!user) {
      throw new NotFoundException(ErrorCode.UserNotFound);
    }
    if (user.isMfaEnabled && user.mfaSecret) {
      throw new ConflictException(ErrorCode.AuthMfaAlreadyEnabled);
    }

    // get and return secret & QR code
    return this.generateQrDataUrl(user.email);
  }

  /**
   * Enable MFA for a user
   * @param {string} userId The ID of the user
   * @param {MfaEnableDTO} data The MFA enable data
   * @returns {UserPayload} The updated user payload
   * @throws {NotFoundException} ErrorCode.UserNotFound
   * @throws {ConflictException} ErrorCode.AuthMfaAlreadyEnabled
   * @throws {ForbiddenException} ErrorCode.AuthMfaInvalidCode
   */
  public async enableMfa(userId: string, data: MfaEnableDTO): Promise<UserPayload> {
    const user = await this.db.$transaction(async (tx) => {
      // find user by ID
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { mfaSecret: true, isMfaEnabled: true },
      });
      if (!user) {
        throw new NotFoundException(ErrorCode.UserNotFound);
      }

      // check if MFA can be enabled
      if (user.isMfaEnabled && user.mfaSecret) {
        throw new ConflictException(ErrorCode.AuthMfaAlreadyEnabled);
      }

      // verify token
      const ok = await this.verifyToken(data.totp, data.secret);
      if (!ok) {
        throw new ForbiddenException(ErrorCode.AuthMfaInvalidCode);
      }

      // enable MFA & store secret
      return tx.user.update({
        where: { id: userId },
        data: {
          isMfaEnabled: true,
          mfaSecret: data.secret,
        },
        include: { profile: true, preferences: true },
      });
    });

    return user;
  }

  /**
   * Disable MFA for a user
   * @param {string} userId The ID of the user
   * @param {MfaVerifyDTO} data The MFA verification data
   * @returns {UserPayload} The updated user payload
   * @throws {NotFoundException} ErrorCode.UserNotFound
   * @throws {ConflictException} ErrorCode.AuthMfaNotEnabled
   * @throws {UnauthorizedException} ErrorCode.AuthMfaInvalidCode
   * @throws {InternalServerErrorException} ErrorCode.EmailFailedToSend
   */
  public async disableMfa(userId: string, data: MfaVerifyDTO): Promise<UserPayload> {
    const user = await this.db.$transaction(async (tx) => {
      // find user by ID
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { mfaSecret: true, isMfaEnabled: true },
      });

      // check if MFA can be disabled
      if (!user.isMfaEnabled) {
        throw new ConflictException(ErrorCode.AuthMfaNotEnabled);
      }

      // verify token
      const ok = await this.verifyToken(data.totp, user.mfaSecret);
      if (!ok) {
        throw new UnauthorizedException(ErrorCode.AuthMfaInvalidCode);
      }

      // disable MFA & remove secret
      return tx.user.update({
        where: { id: userId },
        data: {
          isMfaEnabled: false,
          mfaSecret: null,
        },
        include: { profile: true, preferences: true },
      });
    });

    return user;
  }

  /**
   * Generate a new secret for the user
   * @param email The user's email
   * @returns {{secret: string; otpauth: string}} The generated secret and otpauth URI
   */
  private generateSecret(email: string) {
    const secret = otplib.generateSecret();
    const otpauth = otplib.generateURI({
      issuer: ENV.AUTH_RP_NAME,
      label: email,
      secret: secret,
    });
    return { secret, otpauth };
  }

  private async generateQrDataUrl(email: string) {
    const { secret, otpauth } = this.generateSecret(email);
    const dataUrl = await qrcode.toDataURL(otpauth);
    return { secret, dataUrl, otpauth };
  }
}
