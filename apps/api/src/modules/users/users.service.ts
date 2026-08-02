import { UserDelegate } from '@/generated/prisma/models';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createCaslAccessibleWhere, QueryOptionsMap, QueryService } from '@querry-kit/nest';
import sharp from 'sharp';
import { S3Bucket } from '~/config/s3';
import { UserTypeMap } from '~/modules/users/types';
import { PrismaService } from '~/prisma/prisma.service';

import { ErrorCode } from '@ezinventory/shared/types/error-code';
import { S3Service } from '~/services/s3.service';
import { AppAbility } from '~/types/casl';
import { CaslAction } from '~/types/casl/action';
import { CaslSubject } from '~/types/casl/subject';
import { UserPayload } from '~/types/modules/user';
import { CreateUserDTO } from '~/types/modules/user/create-user.dto';
import { UpdateUserPasswordDTO } from '~/types/modules/user/update-user-password.dto';
import { UpdateUserDTO } from '~/types/modules/user/update-user.dto';
import { CryptoUtil } from '~/util/crypto';

@Injectable()
export class UsersService extends QueryService<
  UserDelegate,
  UserTypeMap,
  UserDelegate,
  QueryOptionsMap<UserTypeMap>,
  AppAbility,
  CaslSubject.User
> {
  public static readonly token = 'USERS_SERVICE';

  constructor(protected readonly db: PrismaService) {
    super(db.user, {
      subject: CaslSubject.User,
      accessibleWhere: createCaslAccessibleWhere<AppAbility, CaslSubject.User, CaslAction>({
        action: CaslAction.Read,
      }),
    });
  }

  //#region CRUD
  public async findByIdWithPreferencesAndProfile(id: string) {
    return this.db.user.findUnique({
      where: { id },
      include: {
        profile: true,
        preferences: true,
      },
    });
  }

  /**
   * Create a new user
   * @param {CreateUserDTO} data Data to create user
   * @returns {UserPayload} Created user
   * @throws {ConflictException} ErrorCode.UserConflictSameEmail
   * @throws {NotFoundException} ErrorCode.BranchNotFound
   * @throws {BadRequestException} ErrorCode.UserCreateBranchArchived
   * @throws {InternalServerErrorException} ErrorCode.EmailFailedToSend
   */
  public async create(data: CreateUserDTO): Promise<UserPayload> {
    const user = await this.db.$transaction(async (tx) => {
      // check if user exists
      const existingUser = await tx.user.findUnique({ where: { email: data.email } });
      if (existingUser) {
        throw new ConflictException(
          ErrorCode.UserConflictSameEmail,
          'User with this email already exists.',
        );
      }

      // create user
      const password = await CryptoUtil.encryptPassword(data.password);
      return tx.user.create({
        data: {
          email: data.email,
          password: password,
          profile: {
            create: {
              ...data.profile,
            },
          },
          preferences: {
            create: {
              ...data.preferences,
              timezone: data.preferences.timezone,
            },
          },
        },
        include: {
          profile: true,
          preferences: true,
        },
      });
    });

    // return created user
    return user;
  }

  /**
   * Update user by ID
   * @param {string} id The ID of the user to update
   * @param {UpdateUserDTO} data The data to update the user with
   * @returns {UserPayload} The updated user
   * @throws {NotFoundException} ErrorCode.UserNotFound
   * @throws {BadRequestException} ErrorCode.UserArchived
   * @throws {NotFoundException} ErrorCode.BranchNotFound
   */
  public async update(id: string, data: UpdateUserDTO): Promise<UserPayload> {
    return this.db.$transaction(async (tx) => {
      // find user by ID
      const user = await tx.user.findUnique({ where: { id } });
      if (!user) {
        throw new NotFoundException(ErrorCode.UserNotFound);
      }

      // update user
      return tx.user.update({
        where: { id },
        data: { ...data },
        include: {
          profile: true,
          preferences: true,
        },
      });
    });
  }

  /**
   * Delete user by ID
   * @param {string} id The ID of the user to delete
   * @returns {UserPayload} The deleted user
   * @throws {NotFoundException} ErrorCode.UserNotFound
   */
  public async deleteUser(id: string): Promise<UserPayload> {
    return this.db.$transaction(async (tx) => {
      // find user by ID
      const user = await tx.user.findUnique({ where: { id } });
      if (!user) {
        throw new NotFoundException(ErrorCode.UserNotFound);
      }

      // delete user
      return tx.user.delete({
        where: { id },
        include: { profile: true, preferences: true },
      });
    });
  }

  /**
   * Set a new password for a user by ID.
   * @param {string} id The ID of the user to update
   * @param {UpdateUserPasswordDTO} data The new password data
   * @returns {UserPayload} The updated user
   * @throws {NotFoundException} ErrorCode.UserNotFound
   */
  public async setPassword(id: string, data: UpdateUserPasswordDTO): Promise<UserPayload> {
    return this.db.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id } });
      if (!user) {
        throw new NotFoundException(ErrorCode.UserNotFound);
      }

      const hashedPassword = await CryptoUtil.encryptPassword(data.password);

      return tx.user.update({
        where: { id },
        data: {
          password: hashedPassword,
          passwordChangedAt: new Date(),
        },
        include: {
          profile: true,
          preferences: true,
        },
      });
    });
  }

  /**
   * Disable MFA for a user by ID.
   * @param {string} id The ID of the user to update
   * @returns {UserPayload} The updated user
   * @throws {NotFoundException} ErrorCode.UserNotFound
   * @throws {ConflictException} ErrorCode.AuthMfaNotEnabled
   */
  public async disableMfa(id: string): Promise<UserPayload> {
    return this.db.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id },
        select: { isMfaEnabled: true },
      });
      if (!user) {
        throw new NotFoundException(ErrorCode.UserNotFound);
      }
      if (!user.isMfaEnabled) {
        throw new ConflictException(ErrorCode.AuthMfaNotEnabled);
      }

      return tx.user.update({
        where: { id },
        data: {
          isMfaEnabled: false,
          mfaSecret: null,
        },
        include: {
          profile: true,
          preferences: true,
        },
      });
    });
  }
  //#endregion

  //#region avatar
  /**
   * Update user avatar
   * @param {string} userId The ID of the user
   * @param {Express.Multer.File} file The avatar file
   * @returns {UserPayload} The updated user
   * @throws {BadRequestException} ErrorCode.FileUploadNoFileProvided
   * @throws {BadRequestException} ErrorCode.UserArchived
   * @throws {NotFoundException} ErrorCode.UserNotFound
   */
  public async updateAvatar(userId: string, file: Express.Multer.File): Promise<UserPayload> {
    if (!file) {
      throw new BadRequestException(ErrorCode.FileUploadNoFileProvided, 'File is required.');
    }

    return this.db.$transaction(async (tx) => {
      // find user
      const user = await tx.user.findUnique({ where: { id: userId }, include: { profile: true } });
      if (!user) {
        throw new NotFoundException(ErrorCode.UserNotFound);
      }

      // convert file to webp and correct format
      const webpBuffer = await sharp(file.buffer)
        .resize({ width: 512, height: 512, fit: 'cover' })
        .webp({ quality: 90 })
        .toBuffer();

      // upload avatar
      const id = crypto.randomUUID();
      await S3Service.uploadFile(S3Bucket.Avatars, id, webpBuffer, {
        originalFileName: file.originalname,
      });

      // delete old avatar
      if (user.profile.avatarId) {
        await S3Service.deleteFile(S3Bucket.Avatars, user.profile.avatarId);
      }

      // update user
      return tx.user.update({
        where: { id: userId },
        data: { profile: { update: { avatarId: id } } },
        include: { profile: true, preferences: true },
      });
    });
  }

  /**
   * Delete user avatar
   * @param {string} userId The ID of the user
   * @returns {UserPayload} The updated user
   * @throws {NotFoundException} ErrorCode.UserNotFound
   * @throws {BadRequestException} ErrorCode.UserArchived
   */
  public async deleteAvatar(userId: string): Promise<UserPayload> {
    return this.db.$transaction(async (tx) => {
      // find user
      const user = await tx.user.findUnique({ where: { id: userId }, include: { profile: true } });
      if (!user) {
        throw new NotFoundException(ErrorCode.UserNotFound);
      }

      // delete avatar
      if (user.profile.avatarId) {
        await S3Service.deleteFile(S3Bucket.Avatars, user.profile.avatarId);
      }

      // update user
      return tx.user.update({
        where: { id: userId },
        data: { profile: { update: { avatarId: null } } },
        include: { profile: true, preferences: true },
      });
    });
  }
  //#endregion
}
