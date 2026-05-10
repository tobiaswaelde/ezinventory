import { WarehouseUserRole } from '@/generated/prisma/enums';
import { ErrorCode } from '@ezinventory/shared/types/error-code';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '~/prisma/prisma.service';
import { UserPayload } from '~/types/modules/user';
import { UserOnWarehousePayload, WarehousePayload } from '~/types/modules/warehouses';
import { AddWarehouseMemberDTO } from '~/types/modules/warehouses/add-warehouse-member.dto';
import { UpdateWarehouseMemberDTO } from '~/types/modules/warehouses/update-warehouse-member.dto';
import { PrismaTransaction } from '~/types/prisma';

@Injectable()
export class WarehouseMembersService {
  public static readonly token = 'WAREHOUSE_MEMBERS_SERVICE';

  constructor(private readonly db: PrismaService) {}

  /**
   * Get all members of a warehouse.
   * @param {UserPayload} user The user making the request
   * @param {string} warehouseId ID of the warehouse to get members for
   * @returns {UserOnWarehousePayload[]} List of warehouse members
   * @throws {ForbiddenException} ErrorCode.InsufficientPermissions
   * @throws {NotFoundException} ErrorCode.WarehouseNotFound
   */
  public async getMembers(
    user: UserPayload,
    warehouseId: string,
  ): Promise<UserOnWarehousePayload[]> {
    return this.db.$transaction(async (tx) => {
      // find warehouse by ID
      await this.checkWarehouseExists(tx, warehouseId);

      // check if user has access to the warehouse
      await this.checkIsMember(tx, warehouseId, user.id);

      // find members of the warehouse
      return tx.warehouseUser.findMany({
        where: { AND: { warehouseId } },
        include: { user: { include: { profile: true } } },
      });
    });
  }

  /**
   * Add a member to a warehouse.
   * @param {UserPayload} user The user making the request
   * @param {string} warehouseId ID of the warehouse to add the member to
   * @param {AddWarehouseMemberDTO} data Data for the new warehouse member
   * @returns {UserOnWarehousePayload} The newly added warehouse member
   * @throws {ForbiddenException} ErrorCode.InsufficientPermissions
   * @throws {NotFoundException} ErrorCode.WarehouseNotFound
   * @throws {NotFoundException} ErrorCode.UserNotFound
   * @throws {BadRequestException} ErrorCode.WarehouseMemberAlreadyExists
   */
  public async addMember(
    user: UserPayload,
    warehouseId: string,
    data: AddWarehouseMemberDTO,
  ): Promise<UserOnWarehousePayload> {
    return this.db.$transaction(async (tx) => {
      // validate warehouse and user exist
      await this.checkWarehouseExists(tx, warehouseId);
      await this.checkUserExists(tx, data.userId);

      // check if the requesting user is a member of the warehouse and has the required permissions
      const memberUser = await this.checkIsMember(tx, warehouseId, user.id);
      // MEMBER cannot add MEMBER
      if (memberUser.role === WarehouseUserRole.MEMBER) {
        throw new ForbiddenException(ErrorCode.InsufficientPermissions);
      }
      // MANAGER can only add MEMBER
      else if (
        memberUser.role === WarehouseUserRole.MANAGER &&
        data.role !== WarehouseUserRole.MEMBER
      ) {
        throw new ForbiddenException(ErrorCode.InsufficientPermissions);
      }

      // check if user to add is already a member of the warehouse
      const existingMember = await this.findWarehouseMemberById(tx, warehouseId, data.userId);
      if (existingMember) {
        throw new BadRequestException(ErrorCode.WarehouseMemberAlreadyExists);
      }

      // create warehouse member
      return tx.warehouseUser.create({
        data: {
          warehouseId,
          userId: data.userId,
          role: data.role,
        },
        include: { user: { include: { profile: true } } },
      });
    });
  }

  /**
   * Update a warehouse member.
   * @param {UserPayload} user The user making the request
   * @param {string} warehouseId ID of the warehouse
   * @param {string} memberUserId ID of the member to update
   * @param {UpdateWarehouseMemberDTO} data Data for updating the member
   * @returns {UserOnWarehousePayload} The updated warehouse member
   * @throws {ForbiddenException} ErrorCode.InsufficientPermissions
   * @throws {NotFoundException} ErrorCode.WarehouseNotFound
   * @throws {NotFoundException} ErrorCode.UserNotFound
   * @throws {NotFoundException} ErrorCode.WarehouseMemberNotFound
   */
  public async updateMember(
    user: UserPayload,
    warehouseId: string,
    memberUserId: string,
    data: UpdateWarehouseMemberDTO,
  ): Promise<UserOnWarehousePayload> {
    return this.db.$transaction(async (tx) => {
      // validate warehouse and user exist
      await this.checkWarehouseExists(tx, warehouseId);
      await this.checkUserExists(tx, memberUserId);

      // find warehouse member by warehouse ID and user ID
      const warehouseMember = await this.checkMemberExists(tx, warehouseId, memberUserId);

      // check if the requesting user is a member of the warehouse and has the required permissions
      const memberUser = await this.checkIsMember(tx, warehouseId, user.id);
      if (memberUser.role !== WarehouseUserRole.ADMIN) {
        throw new ForbiddenException(ErrorCode.InsufficientPermissions);
      }

      // if warehouse member is admin, check if other admins exist before updating role
      if (
        warehouseMember.role === WarehouseUserRole.ADMIN &&
        data.role &&
        data.role !== WarehouseUserRole.ADMIN
      ) {
        await this.checkAdminMembers(tx, warehouseId, memberUserId);
      }

      // update warehouse member
      return tx.warehouseUser.update({
        where: { warehouseId_userId: { warehouseId, userId: memberUserId } },
        data: { ...data },
        include: { user: { include: { profile: true } } },
      });
    });
  }

  /**
   * Remove a member from a warehouse.
   * @param {UserPayload} user The user making the request
   * @param {string} warehouseId ID of the warehouse
   * @param {string} memberUserId ID of the member to remove
   * @returns {UserOnWarehousePayload} The removed warehouse member
   * @throws {ForbiddenException} ErrorCode.InsufficientPermissions
   * @throws {NotFoundException} ErrorCode.WarehouseNotFound
   * @throws {NotFoundException} ErrorCode.UserNotFound
   * @throws {NotFoundException} ErrorCode.WarehouseMemberNotFound
   */
  public async removeMember(
    user: UserPayload,
    warehouseId: string,
    memberUserId: string,
  ): Promise<UserOnWarehousePayload> {
    return this.db.$transaction(async (tx) => {
      // validate warehouse and user exist
      await this.checkWarehouseExists(tx, warehouseId);
      await this.checkUserExists(tx, memberUserId);

      // find warehouse member by warehouse ID and user ID
      const warehouseMember = await this.checkMemberExists(tx, warehouseId, memberUserId);

      // check if current user is a member of the warehouse and has the required permissions
      const memberUser = await this.checkIsMember(tx, warehouseId, user.id);
      // MEMBER cannot remove MEMBER
      if (memberUser.role === WarehouseUserRole.MEMBER) {
        throw new ForbiddenException(ErrorCode.InsufficientPermissions);
      }
      // MANAGER can only remove MEMBER
      else if (
        memberUser.role === WarehouseUserRole.MANAGER &&
        warehouseMember.role !== WarehouseUserRole.MEMBER
      ) {
        throw new ForbiddenException(ErrorCode.InsufficientPermissions);
      }

      // if warehouse member is admin, check if other admins exist before removing
      if (warehouseMember.role === WarehouseUserRole.ADMIN) {
        await this.checkAdminMembers(tx, warehouseId, memberUserId);
      }

      // remove warehouse member
      return tx.warehouseUser.delete({
        where: { warehouseId_userId: { warehouseId, userId: memberUserId } },
        include: { user: { include: { profile: true } } },
      });
    });
  }

  //#region util
  /**
   * Check if warehouse exists.
   * @param {PrismaTransaction} tx Prisma transaction
   * @param {string} warehouseId ID of the warehouse to check
   * @returns {WarehousePayload} The warehouse
   * @throws {NotFoundException} ErrorCode.WarehouseNotFound
   */
  private async checkWarehouseExists(
    tx: PrismaTransaction,
    warehouseId: string,
  ): Promise<WarehousePayload> {
    const warehouse = await tx.warehouse.findUnique({ where: { id: warehouseId } });
    if (!warehouse) {
      throw new NotFoundException(ErrorCode.WarehouseNotFound);
    }

    return warehouse;
  }

  /**
   * Check if user exists.
   * @param {PrismaTransaction} tx Prisma transaction
   * @param {string} userId ID of the user to check
   * @returns {UserPayload} The user payload
   * @throws {NotFoundException} ErrorCode.UserNotFound
   */
  private async checkUserExists(
    tx: PrismaTransaction,
    userId: string,
  ): Promise<Omit<UserPayload, 'preferences' | 'profile'>> {
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(ErrorCode.UserNotFound);
    }

    return user;
  }

  /**
   * Find a warehouse member by warehouse ID and user ID.
   * @param tx Prisma transaction
   * @param warehouseId ID of the warehouse
   * @param userId ID of the user
   * @returns {UserOnWarehousePayload|null} The warehouse member if found, otherwise null
   * @throws {NotFoundException} ErrorCode.WarehouseNotFound
   */
  private async findWarehouseMemberById(
    tx: PrismaTransaction,
    warehouseId: string,
    userId: string,
  ): Promise<UserOnWarehousePayload | null> {
    return tx.warehouseUser.findUnique({
      where: {
        warehouseId_userId: {
          warehouseId,
          userId,
        },
      },
    });
  }

  /**
   * Check if a warehouse member exists by warehouse ID and user ID.
   * @param {PrismaTransaction} tx Prisma transaction
   * @param {string} warehouseId ID of the warehouse
   * @param {string} userId ID of the user
   * @returns {UserOnWarehousePayload} The warehouse member if found, otherwise throws NotFoundException
   * @throws {NotFoundException} ErrorCode.WarehouseMemberNotFound
   */
  private async checkMemberExists(
    tx: PrismaTransaction,
    warehouseId: string,
    userId: string,
  ): Promise<UserOnWarehousePayload> {
    const member = await this.findWarehouseMemberById(tx, warehouseId, userId);
    if (!member) {
      throw new NotFoundException(ErrorCode.WarehouseMemberNotFound);
    }

    return member;
  }

  /**
   * Check if a user is a member of a warehouse by warehouse ID and user ID.
   * @param {PrismaTransaction} tx Prisma transaction
   * @param {string} warehouseId ID of the warehouse
   * @param {string} userId ID of the user
   * @returns {UserOnWarehousePayload} The warehouse member if found, otherwise throws NotFoundException
   * @throws {ForbiddenException} ErrorCode.InsufficientPermissions
   */
  private async checkIsMember(
    tx: PrismaTransaction,
    warehouseId: string,
    userId: string,
  ): Promise<UserOnWarehousePayload> {
    const member = await this.findWarehouseMemberById(tx, warehouseId, userId);
    if (!member) {
      throw new ForbiddenException(ErrorCode.InsufficientPermissions);
    }

    return member;
  }

  /**
   * Check that at least one admin remains in the warehouse.
   * @param {PrismaTransaction} tx Prisma transaction
   * @param {string} warehouseId ID of the warehouse
   * @param {string} userId ID of the user to exclude from the check
   * @throws {BadRequestException} ErrorCode.WarehouseMemberCannotRemoveLastAdmin
   */
  private async checkAdminMembers(tx: PrismaTransaction, warehouseId: string, userId: string) {
    const adminsCount = await tx.warehouseUser.count({
      where: {
        warehouseId: warehouseId,
        userId: { not: userId },
        role: WarehouseUserRole.ADMIN,
      },
    });

    if (adminsCount === 0) {
      throw new BadRequestException(ErrorCode.WarehouseMemberCannotRemoveLastAdmin);
    }
  }
  //#endregion
}
