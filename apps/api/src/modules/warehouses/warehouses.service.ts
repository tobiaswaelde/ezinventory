import { WarehouseUserRole } from '@/generated/prisma/enums';
import { WarehouseDelegate } from '@/generated/prisma/models';
import { ErrorCode } from '@ezinventory/shared/types/error-code';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { QueryService } from '~/lib/query-service/query.service';
import { WarehouseTypeMap } from '~/modules/warehouses/types';
import { PrismaService } from '~/prisma/prisma.service';
import { CaslSubject } from '~/types/casl/subject';
import { CreateAddressDTO } from '~/types/modules/address/create-address.dto';
import { WarehousePayload } from '~/types/modules/warehouses';
import { CreateWarehouseDTO } from '~/types/modules/warehouses/create-warehouse.dto';
import { UpdateWarehouseDTO } from '~/types/modules/warehouses/update-warehouse.dto';

@Injectable()
export class WarehousesService extends QueryService<WarehouseDelegate, WarehouseTypeMap> {
  public static readonly token = 'WAREHOUSES_SERVICE';

  constructor(protected readonly db: PrismaService) {
    super(db.warehouse, CaslSubject.Warehouse);
  }

  private isCreateAddressDTO(data: unknown): data is CreateAddressDTO {
    if (!data || typeof data !== 'object') return false;
    const address = data as Partial<CreateAddressDTO>;
    return Boolean(address.street && address.city && address.zip && address.countryCode);
  }

  /**
   * Create a new warehouse.
   * @param {string} userId The ID of the user creating the warehouse
   * @param {CreateWarehouseDTO} data The data for the new warehouse
   * @returns {WarehousePayload} The created warehouse
   * @throws {ConflictException} ErrorCode.WarehouseConflictSameName
   */
  public async create(userId: string, data: CreateWarehouseDTO): Promise<WarehousePayload> {
    return this.db.$transaction(async (tx) => {
      // check if a warehouse with the same name already exists
      const existingWarehouse = await tx.warehouse.findUnique({
        where: { name: data.name },
      });
      if (existingWarehouse) {
        throw new ConflictException(ErrorCode.WarehouseConflictSameName);
      }

      const { address, ...warehouseData } = data;

      // create the new warehouse
      const warehouse = await tx.warehouse.create({
        data: {
          ...warehouseData,
          address: address ? { create: address } : undefined,
          members: {
            create: {
              userId,
              role: WarehouseUserRole.ADMIN,
            },
          },
        },
        include: { members: true, address: true },
      });

      return warehouse;
    });
  }

  /**
   * Update an existing warehouse.
   *
   * Only users with ADMIN or MANAGER role can update a warehouse.
   * @param {string} userId The ID of the user updating the warehouse
   * @param {string} id The ID of the warehouse to update
   * @param {UpdateWarehouseDTO} data The data to update the warehouse with
   * @returns {WarehousePayload} The updated warehouse
   * @throws {NotFoundException} ErrorCode.WarehouseNotFound
   * @throws {ForbiddenException} ErrorCode.InsufficientPermissions
   * @throws {ConflictException} ErrorCode.WarehouseConflictSameName
   */
  public async update(
    userId: string,
    id: string,
    data?: UpdateWarehouseDTO,
  ): Promise<WarehousePayload> {
    return this.db.$transaction(async (tx) => {
      // find warehouse by ID
      const warehouse = await tx.warehouse.findUnique({
        where: { id },
        include: { members: { where: { userId } }, address: true },
      });
      // check if warehouse exists
      if (!warehouse) {
        throw new NotFoundException(ErrorCode.WarehouseNotFound);
      }
      // check if user is a member of the warehouse
      if (warehouse.members.length === 0) {
        throw new NotFoundException(ErrorCode.WarehouseNotFound);
      }
      // check if user has permission to update the warehouse
      const member = warehouse.members[0];
      const allowedRoles: WarehouseUserRole[] = [
        WarehouseUserRole.ADMIN,
        WarehouseUserRole.MANAGER,
      ];
      if (!allowedRoles.includes(member.role)) {
        throw new ForbiddenException(ErrorCode.InsufficientPermissions);
      }

      // check if a warehouse with the same name already exists (excluding the current warehouse)
      if (data?.name) {
        const existingWarehouse = await tx.warehouse.findFirst({
          where: {
            name: data.name,
            id: { not: id },
          },
        });
        if (existingWarehouse) {
          throw new ConflictException(ErrorCode.WarehouseConflictSameName);
        }
      }

      const { address, ...warehouseData } = data ?? {};

      // remove address relation and delete address entity
      if (address === null && warehouse.addressId) {
        await tx.warehouse.update({
          where: { id },
          data: { address: { disconnect: true } },
        });
        await tx.address.deleteMany({
          where: {
            id: warehouse.addressId,
            warehouses: { none: {} },
          },
        });
      }

      // update existing or create/connect new address
      if (address !== undefined && address !== null) {
        if (warehouse.addressId) {
          await tx.address.update({
            where: { id: warehouse.addressId },
            data: address,
          });
        } else {
          if (!this.isCreateAddressDTO(address)) {
            throw new BadRequestException(
              'A full address is required when adding an address to a warehouse without one.',
            );
          }

          const createdAddress = await tx.address.create({ data: address });
          await tx.warehouse.update({
            where: { id },
            data: {
              address: {
                connect: { id: createdAddress.id },
              },
            },
          });
        }
      }

      // update the warehouse
      return tx.warehouse.update({
        where: { id },
        data: {
          ...warehouseData,
        },
        include: { members: { include: { user: true } }, address: true },
      });
    });
  }

  /**
   * Delete a warehouse.
   *
   * Only users with ADMIN role can delete a warehouse.
   * @param {string} userId The ID of the user deleting the warehouse
   * @param {string} id The ID of the warehouse to delete
   * @returns {WarehousePayload} The deleted warehouse
   * @throws {NotFoundException} ErrorCode.WarehouseNotFound
   * @throws {ForbiddenException} ErrorCode.InsufficientPermissions
   */
  public async delete(userId: string, id: string): Promise<WarehousePayload> {
    return this.db.$transaction(async (tx) => {
      // find warehouse by ID
      const warehouse = await tx.warehouse.findUnique({
        where: { id },
        include: { members: { where: { userId } }, address: true },
      });
      // check if warehouse exists
      if (!warehouse) {
        throw new NotFoundException(ErrorCode.WarehouseNotFound);
      }
      // check if user is a member of the warehouse
      if (warehouse.members.length === 0) {
        throw new NotFoundException(ErrorCode.WarehouseNotFound);
      }
      // check if user has permission to delete the warehouse
      const member = warehouse.members[0];
      if (member.role !== WarehouseUserRole.ADMIN) {
        throw new ForbiddenException(ErrorCode.InsufficientPermissions);
      }

      // delete the warehouse
      const deletedWarehouse = await tx.warehouse.delete({
        where: { id },
        include: { members: true, address: true },
      });

      // remove orphaned address entity
      if (warehouse.addressId) {
        await tx.address.deleteMany({
          where: {
            id: warehouse.addressId,
            warehouses: { none: {} },
          },
        });
      }

      return deletedWarehouse;
    });
  }
}
