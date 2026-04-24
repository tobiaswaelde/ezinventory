import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '~/prisma/prisma.service';
import { ErrorCode } from '~/types/error-code';
import { UserProfilePayload } from '~/types/modules/user-profile';
import { UpdateUserProfileDTO } from '~/types/modules/user-profile/update-user-profile.dto';

@Injectable()
export class UserProfileService {
  public static readonly token = 'USER_PROFILE_SERVICE';

  constructor(protected readonly db: PrismaService) {}

  public async getProfile(userId: string): Promise<UserProfilePayload> {
    return this.db.userProfile.findUnique({
      where: { userId: userId },
      include: {},
    });
  }

  /**
   * Update user profile
   * @param {string} userId The ID of the user
   * @param {UpdateUserProfileDTO} data The profile data to update
   * @returns {UserProfilePayload} The updated user profile
   * @throws {NotFoundException} ErrorCode.UserNotFound
   */
  public async updateProfile(
    userId: string,
    data: UpdateUserProfileDTO,
  ): Promise<UserProfilePayload> {
    return this.db.$transaction(async (tx) => {
      // find user by ID
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException(ErrorCode.UserNotFound);
      }

      // update profile
      return tx.userProfile.upsert({
        where: { userId },
        create: {
          ...data,
          firstname: data.firstname ?? '',
          lastname: data.lastname ?? '',
          user: { connect: { id: userId } },
        },
        update: {
          ...data,
        },
      });
    });
  }
}
