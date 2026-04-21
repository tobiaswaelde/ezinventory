import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import prismaClient from '@prisma/client';
import type { Prisma as PrismaType, UserRole as UserRoleType } from '@prisma/client';
import argon2 from 'argon2';

import type { CaslAction, CaslSubject } from '~/modules/auth/casl/casl-ability.types.js';
import { BootstrapAdminDto } from '~/modules/setup/dto/bootstrap-admin.dto.js';
import { CreatePermissionPolicyDto } from '~/modules/setup/dto/create-permission-policy.dto.js';
import { CreateUserByAdminDto } from '~/modules/setup/dto/create-user-by-admin.dto.js';
import { type UserSortableField, ListUsersQueryDto } from '~/modules/setup/dto/list-users-query.dto.js';
import { ReplaceUserPoliciesDto } from '~/modules/setup/dto/replace-user-policies.dto.js';
import { RegistrationMode, UpdateRegistrationModeDto } from '~/modules/setup/dto/update-registration-mode.dto.js';
import { UpdateUserRoleDto } from '~/modules/setup/dto/update-user-role.dto.js';
import { REGISTRATION_MODE_KEY, SETUP_INITIALIZED_KEY } from '~/modules/setup/setup.constants.js';
import { PrismaService } from '~/prisma/prisma.service.js';

const { Prisma, UserRole } = prismaClient as typeof import('@prisma/client');

type PermissionPolicyResponse = {
  id: string;
  action: CaslAction;
  subject: CaslSubject;
  inverted: boolean;
  conditions: unknown;
  reason: string | null;
  createdAt: Date;
};

const USER_LIST_ALLOWED_FIELDS = [
  'id',
  'email',
  'displayName',
  'role',
  'preferredLanguage',
  'createdAt',
  'updatedAt',
  'policyIds'
] as const;

type UserListAllowedField = (typeof USER_LIST_ALLOWED_FIELDS)[number];

@Injectable()
export class SetupService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getSetupStatus(): Promise<{ setupInitialized: boolean; registrationMode: RegistrationMode }> {
    const setupInitializedSetting = await this.prisma.systemSetting.findUnique({
      where: { key: SETUP_INITIALIZED_KEY },
      select: { value: true }
    });

    const setupInitialized = setupInitializedSetting?.value === true;

    if (!setupInitialized) {
      return {
        setupInitialized: false,
        registrationMode: RegistrationMode.ADMIN_ONLY
      };
    }

    const registrationModeSetting = await this.prisma.systemSetting.findUnique({
      where: { key: REGISTRATION_MODE_KEY },
      select: { value: true }
    });

    const registrationMode =
      typeof registrationModeSetting?.value === 'string' && Object.values(RegistrationMode).includes(registrationModeSetting.value as RegistrationMode)
        ? (registrationModeSetting.value as RegistrationMode)
        : RegistrationMode.ADMIN_ONLY;

    return {
      setupInitialized: true,
      registrationMode
    };
  }

  async bootstrapAdmin(dto: BootstrapAdminDto): Promise<{ setupInitialized: true; adminUserId: string; email: string }> {
    const existingAdmin = await this.prisma.user.findFirst({
      where: { role: UserRole.ADMIN },
      select: { id: true }
    });

    if (existingAdmin) {
      throw new ConflictException('Initial setup is already completed.');
    }

    const passwordHash = await argon2.hash(dto.password);

    const admin = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        displayName: dto.displayName,
        passwordHash,
        role: UserRole.ADMIN,
        preferredLanguage: 'en'
      },
      select: {
        id: true,
        email: true
      }
    });

    await this.prisma.systemSetting.upsert({
      where: { key: SETUP_INITIALIZED_KEY },
      update: { value: true },
      create: { key: SETUP_INITIALIZED_KEY, value: true }
    });

    await this.prisma.systemSetting.upsert({
      where: { key: REGISTRATION_MODE_KEY },
      update: { value: RegistrationMode.ADMIN_ONLY },
      create: { key: REGISTRATION_MODE_KEY, value: RegistrationMode.ADMIN_ONLY }
    });

    return {
      setupInitialized: true,
      adminUserId: admin.id,
      email: admin.email
    };
  }

  async updateRegistrationMode(dto: UpdateRegistrationModeDto): Promise<{ mode: RegistrationMode }> {
    const initialized = await this.prisma.systemSetting.findUnique({
      where: { key: SETUP_INITIALIZED_KEY }
    });

    if (!initialized || initialized.value !== true) {
      throw new NotFoundException('Setup is not initialized yet.');
    }

    await this.prisma.systemSetting.upsert({
      where: { key: REGISTRATION_MODE_KEY },
      update: { value: dto.mode },
      create: { key: REGISTRATION_MODE_KEY, value: dto.mode }
    });

    return { mode: dto.mode };
  }

  async createUserByAdmin(dto: CreateUserByAdminDto): Promise<{ id: string; email: string; role: UserRoleType }> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      select: { id: true }
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists.');
    }

    const passwordHash = await argon2.hash(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        displayName: dto.displayName,
        passwordHash,
        role: dto.role,
        preferredLanguage: dto.preferredLanguage ?? 'en'
      },
      select: {
        id: true,
        email: true,
        role: true
      }
    });

    return user;
  }

  async listUsers(query: ListUsersQueryDto = {}): Promise<Array<Record<string, unknown>>> {
    const fields = this.parseUserListFields(query.fields);
    const where = this.buildUserListWhere(query);
    const orderBy = this.buildUserListOrderBy(query.sortBy, query.sortDir);
    const select = this.buildUserListSelect(fields);

    const users = await this.prisma.user.findMany({
      where,
      orderBy: [orderBy],
      select
    });

    return users.map((user) => ({
      ...('id' in user ? { id: user.id } : {}),
      ...('email' in user ? { email: user.email } : {}),
      ...('displayName' in user ? { displayName: user.displayName } : {}),
      ...('role' in user ? { role: user.role } : {}),
      ...('preferredLanguage' in user ? { preferredLanguage: user.preferredLanguage } : {}),
      ...('createdAt' in user ? { createdAt: user.createdAt } : {}),
      ...('updatedAt' in user ? { updatedAt: user.updatedAt } : {}),
      ...('userPolicies' in user
        ? { policyIds: user.userPolicies.map((policy) => policy.permissionPolicyId) }
        : {})
    })) as Array<Record<string, unknown>>;
  }

  async updateUserRole(userId: string, dto: UpdateUserRoleDto): Promise<{ id: string; role: UserRoleType }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { role: dto.role },
      select: {
        id: true,
        role: true
      }
    });

    return updated;
  }

  async listPermissionPolicies(): Promise<PermissionPolicyResponse[]> {
    const policies = await this.prisma.permissionPolicy.findMany({
      orderBy: [{ createdAt: 'desc' }],
      select: {
        id: true,
        action: true,
        subject: true,
        inverted: true,
        conditions: true,
        reason: true,
        createdAt: true
      }
    });

    return policies.map((policy) => ({
      id: policy.id,
      action: policy.action as CaslAction,
      subject: policy.subject as CaslSubject,
      inverted: policy.inverted,
      conditions: policy.conditions,
      reason: policy.reason,
      createdAt: policy.createdAt
    }));
  }

  async createPermissionPolicy(dto: CreatePermissionPolicyDto): Promise<PermissionPolicyResponse> {
    const created = await this.prisma.permissionPolicy.create({
      data: {
        action: dto.action,
        subject: dto.subject,
        conditions: dto.conditions ? (dto.conditions as PrismaType.InputJsonValue) : Prisma.JsonNull,
        inverted: dto.inverted ?? false,
        reason: dto.reason ?? null
      },
      select: {
        id: true,
        action: true,
        subject: true,
        inverted: true,
        conditions: true,
        reason: true,
        createdAt: true
      }
    });

    return {
      id: created.id,
      action: created.action as CaslAction,
      subject: created.subject as CaslSubject,
      inverted: created.inverted,
      conditions: created.conditions,
      reason: created.reason,
      createdAt: created.createdAt
    };
  }

  async replaceUserPolicies(userId: string, dto: ReplaceUserPoliciesDto): Promise<{ userId: string; policyIds: string[] }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if (dto.policyIds.length > 0) {
      const existingPolicies = await this.prisma.permissionPolicy.findMany({
        where: { id: { in: dto.policyIds } },
        select: { id: true }
      });

      if (existingPolicies.length !== dto.policyIds.length) {
        throw new NotFoundException('One or more permission policies do not exist.');
      }
    }

    await this.prisma.$transaction([
      this.prisma.userPermissionPolicy.deleteMany({
        where: { userId }
      }),
      ...(dto.policyIds.length > 0
        ? [
            this.prisma.userPermissionPolicy.createMany({
              data: dto.policyIds.map((permissionPolicyId) => ({
                userId,
                permissionPolicyId
              }))
            })
          ]
        : [])
    ]);

    return {
      userId,
      policyIds: dto.policyIds
    };
  }

  private parseUserListFields(rawFields?: string): Set<UserListAllowedField> {
    const requested = new Set<UserListAllowedField>(['id']);

    if (!rawFields) {
      for (const field of USER_LIST_ALLOWED_FIELDS) {
        requested.add(field);
      }
      return requested;
    }

    const tokens = rawFields
      .split(',')
      .map((token) => token.trim())
      .filter(Boolean);

    for (const token of tokens) {
      if ((USER_LIST_ALLOWED_FIELDS as readonly string[]).includes(token)) {
        requested.add(token as UserListAllowedField);
      }
    }

    return requested;
  }

  private buildUserListWhere(query: ListUsersQueryDto): PrismaType.UserWhereInput | undefined {
    const clauses: PrismaType.UserWhereInput[] = [];

    const search = query.search?.trim();
    if (search) {
      clauses.push({
        OR: [
          { displayName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      });
    }

    if (query.role) {
      clauses.push({ role: query.role });
    }

    if (clauses.length === 0) {
      return undefined;
    }

    if (clauses.length === 1) {
      return clauses[0];
    }

    return { AND: clauses };
  }

  private buildUserListOrderBy(
    sortBy: UserSortableField | undefined,
    sortDir: 'asc' | 'desc' | undefined
  ): PrismaType.UserOrderByWithRelationInput {
    return {
      [sortBy ?? 'createdAt']: sortDir ?? 'asc'
    };
  }

  private buildUserListSelect(fields: Set<UserListAllowedField>): PrismaType.UserSelect {
    const select: PrismaType.UserSelect = {
      id: fields.has('id')
    };

    if (fields.has('email')) {
      select.email = true;
    }
    if (fields.has('displayName')) {
      select.displayName = true;
    }
    if (fields.has('role')) {
      select.role = true;
    }
    if (fields.has('preferredLanguage')) {
      select.preferredLanguage = true;
    }
    if (fields.has('createdAt')) {
      select.createdAt = true;
    }
    if (fields.has('updatedAt')) {
      select.updatedAt = true;
    }
    if (fields.has('policyIds')) {
      select.userPolicies = {
        select: {
          permissionPolicyId: true
        }
      };
    }

    return select;
  }
}
