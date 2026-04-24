import { Injectable } from '@nestjs/common';
import { PrismaService } from '~/prisma/prisma.service';
import { UserPreferencesPayload } from '~/types/modules/user-preferences';
import { UpdateUserPreferencesDTO } from '~/types/modules/user-preferences/update-user-preferences.dto';

@Injectable()
export class UserPreferencesService {
  public static readonly token = 'USER_PREFERENCES_SERVICE';

  constructor(protected readonly db: PrismaService) {}

  /**
   * Get user preferences
   * @param {string} userId The ID of the user
   * @returns {UserPreferencesPayload} The user preferences
   */
  public async getPreferences(userId: string): Promise<UserPreferencesPayload> {
    return this.db.userPreferences.findFirst({
      where: { userId },
    });
  }

  /**
   * Update user preferences
   * @param {string} userId The ID of the user
   * @param {UpdateUserPreferencesDTO} data The data to update
   * @returns {UserPreferencesPayload} The updated user preferences
   */
  public async updatePreferences(
    userId: string,
    data: UpdateUserPreferencesDTO,
  ): Promise<UserPreferencesPayload> {
    return this.db.$transaction(async (tx) => {
      return tx.userPreferences.upsert({
        where: { userId },
        create: { userId, ...data },
        update: { ...data },
      });
    });
  }
}
