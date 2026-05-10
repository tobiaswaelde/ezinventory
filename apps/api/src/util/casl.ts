import { subject } from '@casl/ability';
import { accessibleBy } from '@casl/prisma';
import { InternalServerErrorException } from '@nestjs/common';
import { QueryOptionsMap } from '~/lib/query-service/types';
import { AppAbility } from '~/types/casl';
import { CaslAction } from '~/types/casl/action';
import { CaslSubject } from '~/types/casl/subject';
import { ObjectUtil } from '~/util/object';

export class CaslUtil {
  public static filterKeys<T extends Record<string, any>>(
    obj: T,
    subj: CaslSubject,
    ability?: AppAbility,
  ): T {
    // no ability defined -> pass
    // if (!ability) return obj;
    if (!ability) {
      throw new InternalServerErrorException();
    }

    // allowed to read all fields -> pass
    const itemSubject = subject(subj, obj);

    if (ability.can(CaslAction.Read, itemSubject, 'all')) {
      return obj;
    }

    // filter out non-readable fields
    Object.keys(obj).forEach((key) => {
      if (
        !ability.can(CaslAction.Read, itemSubject, key) ||
        ability.cannot(CaslAction.Read, itemSubject, key)
      ) {
        delete obj[key];
      }
    });

    return obj;
  }

  public static filterQuery(
    query: QueryOptionsMap<any>['query'],
    tableName: CaslSubject,
    ability?: AppAbility,
  ) {
    let mergedWhere = ObjectUtil.parse(query.where ?? {});
    if (ability) {
      const where = accessibleBy(ability)[tableName];
      mergedWhere = { AND: [where, mergedWhere] };
    }

    return { ...query, where: mergedWhere };
  }
}
