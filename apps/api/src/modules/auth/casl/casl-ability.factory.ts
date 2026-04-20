import { AbilityBuilder, createMongoAbility } from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';

import type { CaslAction, CaslSubject } from '~/modules/auth/casl/casl-ability.types.js';
import type { AuthenticatedUser } from '~/modules/auth/types/authenticated-user.type.js';
import type { AppAbility } from '~/modules/auth/casl/casl-ability.types.js';
import { PrismaService } from '~/prisma/prisma.service.js';

@Injectable()
export class CaslAbilityFactory {
  constructor(private readonly prisma: PrismaService) {}

  async createForUser(user: AuthenticatedUser): Promise<AppAbility> {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

    switch (user.role) {
      case UserRole.ADMIN:
        can('manage', 'all');
        break;
      case UserRole.MANAGER:
        can('read', 'Category');
        can('create', 'Category');
        can('update', 'Category');
        can('read', 'Location');
        can('create', 'Location');
        can('update', 'Location');
        can('read', 'Container');
        can('create', 'Container');
        can('update', 'Container');
        can('read', 'Item');
        can('create', 'Item');
        can('update', 'Item');
        can('scan', 'Stock');
        can('stock-out', 'Stock');
        break;
      case UserRole.STAFF:
        can('read', 'Category');
        can('read', 'Location');
        can('create', 'Location');
        can('update', 'Location');
        can('read', 'Container');
        can('create', 'Container');
        can('update', 'Container');
        can('read', 'Item');
        can('create', 'Item');
        can('update', 'Item');
        can('scan', 'Stock');
        can('stock-out', 'Stock');
        break;
      case UserRole.VIEWER:
        can('read', 'Category');
        can('read', 'Location');
        can('read', 'Container');
        can('read', 'Item');
        break;
      default:
        break;
    }

    const [rolePolicies, userPolicies] = await Promise.all([
      this.prisma.rolePermissionPolicy.findMany({
        where: { role: user.role },
        select: {
          permissionPolicy: {
            select: {
              action: true,
              subject: true,
              conditions: true,
              inverted: true
            }
          }
        }
      }),
      this.prisma.userPermissionPolicy.findMany({
        where: { userId: user.id },
        select: {
          permissionPolicy: {
            select: {
              action: true,
              subject: true,
              conditions: true,
              inverted: true
            }
          }
        }
      })
    ]);

    for (const row of rolePolicies) {
      this.applyPolicy(can, cannot, row.permissionPolicy);
    }

    for (const row of userPolicies) {
      this.applyPolicy(can, cannot, row.permissionPolicy);
    }

    return build();
  }

  private applyPolicy(
    can: (action: CaslAction, subject: CaslSubject, conditions?: Record<string, unknown>) => void,
    cannot: (action: CaslAction, subject: CaslSubject, conditions?: Record<string, unknown>) => void,
    policy: { action: string; subject: string; conditions: unknown; inverted: boolean }
  ): void {
    const action = policy.action as CaslAction;
    const subject = policy.subject as CaslSubject;
    const conditions = this.toConditionsObject(policy.conditions);

    if (policy.inverted) {
      cannot(action, subject, conditions);
      return;
    }

    can(action, subject, conditions);
  }

  private toConditionsObject(conditions: unknown): Record<string, unknown> | undefined {
    if (!conditions || typeof conditions !== 'object' || Array.isArray(conditions)) {
      return undefined;
    }

    return conditions as Record<string, unknown>;
  }
}
