import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { MfaService } from '~/modules/auth/mfa/mfa.service';
import { PrismaService } from '~/prisma/prisma.service';

import { ErrorCode } from '~/types/error-code';
import { UpdatePasswordDTO } from '~/types/modules/auth/password/update-password.dto';
import { UserPayload } from '~/types/modules/user';
import { CryptoUtil } from '~/util/crypto';

@Injectable()
export class PasswordService {
  public static readonly token = 'PASSWORD_SERVICE';

  constructor(
    private readonly db: PrismaService,
    @Inject(MfaService.token) private readonly mfaService: MfaService,
  ) {}

  /**
   * Update user password
   * @param {string} userId The ID of the user
   * @param {UpdatePasswordDTO} data The new password data
   * @returns {UserPayload} The updated user
   * @throws {NotFoundException} ErrorCode.UserNotFound
   * @throws {UnauthorizedException} ErrorCode.AuthInvalidCredentials
   * @throws {InternalServerErrorException} ErrorCode.EmailFailedToSend
   */
  public async updatePassword(userId: string, data: UpdatePasswordDTO): Promise<UserPayload> {
    return this.db.$transaction(async (tx) => {
      // find user by ID
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException(ErrorCode.UserNotFound);
      }

      // verify current password
      const isValidPassword = await CryptoUtil.verifyPassword(data.currentPassword, user.password);
      if (!isValidPassword) {
        throw new UnauthorizedException(ErrorCode.AuthInvalidCredentials, 'Password incorrect.');
      }

      // update password
      const hashedPassword = await CryptoUtil.encryptPassword(data.newPassword);
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          password: hashedPassword,
          passwordChangeRequested: false,
        },
        include: { profile: true, preferences: true },
      });

      // return updated user
      return updatedUser;
    });
  }
}
