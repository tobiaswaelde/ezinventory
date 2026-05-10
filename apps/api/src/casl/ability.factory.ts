import { User, UserRole } from '@/generated/prisma/client';
import { AbilityBuilder } from '@casl/ability';
import { createPrismaAbility } from '@casl/prisma';
import { PrismaService } from '~/prisma/prisma.service';
import { AppAbility } from '~/types/casl';
import { CaslAction } from '~/types/casl/action';
import { CaslSubject } from '~/types/casl/subject';

export class CaslAbilityFactory {
  public static readonly token = 'CASL_ABILITY_FACTORY';

  constructor(private readonly db: PrismaService) {}

  public createForUser(user: User) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);

    if (user.role === UserRole.ADMIN) {
      can([CaslAction.Create], CaslSubject.User);
      can([CaslAction.Read], CaslSubject.User, [
        'id',
        'createdAt',
        'updatedAt',
        'email',
        'passwordChangedAt',
        'isMfaEnabled',
        'profile',
        'preferences',
      ]);
      can([CaslAction.Update], CaslSubject.User);
      can([CaslAction.Delete], CaslSubject.User);

      can(CaslAction.Create, CaslSubject.Warehouse);
      can(CaslAction.Read, CaslSubject.Warehouse, 'all');
      can(CaslAction.Update, CaslSubject.Warehouse);
      can(CaslAction.Delete, CaslSubject.Warehouse);
    }

    can(CaslAction.Read, CaslSubject.Address);

    can(CaslAction.Read, CaslSubject.User, 'all', { id: user.id });
    can(CaslAction.Read, CaslSubject.User, ['id', 'profile']);
    can(CaslAction.Read, CaslSubject.UserProfile, 'all', { userId: user.id });
    can(CaslAction.Read, CaslSubject.UserProfile, ['firstname', 'lastname', 'avatarUrl']);
    can(CaslAction.Read, CaslSubject.UserPreferences, 'all', { userId: user.id });
    // can(CaslAction.Read, CaslSubject.UserProfile, ['']);

    can(CaslAction.Read, CaslSubject.Warehouse, 'all', {
      usersOnWarehouses: { some: { userId: user.id } },
    });

    return build();
  }
}
