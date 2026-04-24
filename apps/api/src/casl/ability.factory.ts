// import { RoleAction, RolePermission, RoleSubject, User } from '@/generated/prisma/client';
import { AbilityBuilder } from '@casl/ability';
import { createPrismaAbility } from '@casl/prisma';
import { Injectable } from '@nestjs/common';
// import Redis from 'ioredis';
import { PrismaService } from '~/prisma/prisma.service';

export type AppAbility = ReturnType<typeof createPrismaAbility>;

@Injectable()
export class CaslAbilityFactory {
  public static readonly token = 'CASL_ABILITY_FACTORY';

  constructor(
    private readonly db: PrismaService,
    // @Inject(CACHE_MANAGER) private cacheManager: Cache,
    // @Inject('REDIS') private readonly redis: Redis,
  ) {}

  public async createForUser(user: User) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);

    // // load roles for user
    // const userWithRoles = await this.db.user.findUnique({
    //   where: { id: user.id },
    //   include: { roles: true },
    // });

    // // apply dynamic permissions
    // for (const role of userWithRoles.roles) {
    //   const permissions = await this.getPermissionsForRole(role.id);

    //   for (const p of permissions) {
    //     can(
    //       p.action,
    //       p.subject,
    //       p.fields.length > 0 ? p.fields : undefined,
    //       p.conditions ? JSON.parse(p.conditions.toString()) : undefined,
    //     );
    //   }
    // }

    // static permissions
    // can(RoleAction.READ, RoleSubject.USER_LOGIN, ['all'], { userId: user.id });
    // can(RoleAction.READ, RoleSubject.TEAM_USERS, ['all'], { userId: user.id });
    // can(RoleAction.READ, RoleSubject.TEAM_USERS, ['all'], { userId: user.id });
    // can(RoleAction.READ, RoleSubject.TIME_ENTRY, ['all'], { userId: user.id });

    return build({});
  }

  // public async getPermissionsForRole(roleId: string): Promise<RolePermission[]> {
  //   // load data from cache
  //   const cached = await this.redis.get(`role-permissions:${roleId}`);

  //   // if not in cache, load from database and set cache
  //   if (!cached) {
  //     const permissions = await this.db.rolePermission.findMany({ where: { roleId } });
  //     await this.redis.set(`role-permissions:${roleId}`, JSON.stringify(permissions));
  //     return permissions;
  //   }

  //   return JSON.parse(cached) as RolePermission[];
  // }
}
