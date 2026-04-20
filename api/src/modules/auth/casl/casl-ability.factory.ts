import { AbilityBuilder, createMongoAbility } from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';

import type { AuthenticatedUser } from '~/modules/auth/types/authenticated-user.type.js';
import type { AppAbility } from '~/modules/auth/casl/casl-ability.types.js';

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: AuthenticatedUser): AppAbility {
    const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

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

    return build();
  }
}
