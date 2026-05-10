import { subject } from '@casl/ability';
import { accessibleBy } from '@casl/prisma';
import { InternalServerErrorException } from '@nestjs/common';
import { QueryOptionsMap } from '~/lib/query-service/types';
import { AppAbility } from '~/types/casl';
import { CaslAction } from '~/types/casl/action';
import { CaslSubject } from '~/types/casl/subject';
import { ObjectUtil } from '~/util/object';

export class CaslUtil {
  /**
   * Filter an object based on CASL permissions. It checks if the ability allows reading all fields of the subject. If not, it iterates through each key and checks if it can be read. If a key cannot be read, it is deleted from the object.
   * @param {T} obj The object to filter
   * @param {CaslSubject} subj The CASL subject type of the object
   * @param {AppAbility} ability The CASL ability instance to check permissions against
   * @returns {T} The filtered object with only readable fields
   */
  public static filterKeys<T extends Record<string, any>>(
    obj: T,
    subj: CaslSubject,
    ability?: AppAbility,
  ): T {
    // no ability defined -> error
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

  /**
   * Filter a query's where clause based on CASL permissions. It uses the accessibleBy function from @casl/prisma to get the permission filters for the given ability and subject, and merges them with the existing where clause using an AND condition.
   * @param {QueryOptionsMap<any>['query']} query The original query options containing the where clause to filter
   * @param {CaslSubject} tableName The CASL subject type representing the table being queried
   * @param {AppAbility} ability The CASL ability instance to check permissions against
   * @returns {QueryOptionsMap<any>['query']} The modified query options with the merged where clause
   */
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
