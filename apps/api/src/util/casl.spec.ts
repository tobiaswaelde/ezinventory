import * as CaslAbility from '@casl/ability';
import * as CaslPrisma from '@casl/prisma';
import { CaslAction } from '~/types/casl/action';
import { CaslSubject } from '~/types/casl/subject';
import { CaslUtil } from '~/util/casl';

jest.mock('@casl/ability', () => ({
  ...jest.requireActual('@casl/ability'),
  subject: jest.fn((subj, obj) => ({ subj, obj })),
}));

jest.mock('@casl/prisma', () => ({
  accessibleBy: jest.fn((ability) => ({
    users: { id: { gt: 0 } },
    posts: { published: true },
  })),
}));

describe('CaslUtil', () => {
  describe('filterKeys', () => {
    const obj = { id: 1, name: 'Alice', secret: 'top-secret' };
    const subj = CaslSubject.User;

    it('returns the original object if ability is not provided', () => {
      expect(CaslUtil.filterKeys(obj, subj)).toEqual(obj);
    });

    it('returns the original object if all fields are readable', () => {
      const ability = {
        can: jest.fn().mockReturnValue(true),
      };

      expect(CaslUtil.filterKeys(obj, subj, ability as any)).toEqual(obj);
      expect(ability.can).toHaveBeenCalledWith(CaslAction.Read, expect.anything(), 'all');
    });

    it('filters out non-readable fields', () => {
      const ability = {
        can: jest.fn((action, item, key) => {
          if (key === 'all') return false; // cannot read all
          return key !== 'secret'; // can read everything except 'secret'
        }),
      };

      const filtered = CaslUtil.filterKeys({ ...obj }, subj, ability as any);
      expect(filtered).toEqual({ id: 1, name: 'Alice' });
    });

    it('calls subject with correct arguments', () => {
      const ability = { can: jest.fn().mockReturnValue(true) };
      CaslUtil.filterKeys(obj, subj, ability as any);
      expect(CaslAbility.subject).toHaveBeenCalledWith(subj, obj);
    });
  });

  describe('filterQuery', () => {
    const query = { where: { name: 'Alice' }, orderBy: { id: 'asc' }, page: 1, perPage: 10 };
    const tableName = 'users';

    it('returns original query if ability is not provided', () => {
      const result = CaslUtil.filterQuery(query, tableName);
      expect(result).toEqual(query);
    });

    it('merges where clauses with accessibleBy result', () => {
      const ability = {} as any;
      const result = CaslUtil.filterQuery(query, tableName, ability);
      expect(CaslPrisma.accessibleBy).toHaveBeenCalledWith(ability);
      expect(result.where).toEqual({
        AND: [{ id: { gt: 0 } }, { name: 'Alice' }],
      });
    });

    it('handles empty where clause', () => {
      const ability = {} as any;
      const emptyQuery = {
        where: {},
        orderBy: {},
        page: 1,
        perPage: 10,
      };
      const result = CaslUtil.filterQuery(emptyQuery, tableName, ability);
      expect(result.where).toEqual({ AND: [{ id: { gt: 0 } }, {}] });
    });

    it('defaults undefined where to an empty object before merging CASL filters', () => {
      const ability = {} as any;
      const queryWithoutWhere = { orderBy: { id: 'asc' }, page: 1, perPage: 10 } as any;

      const result = CaslUtil.filterQuery(queryWithoutWhere, tableName, ability);

      expect(result.where).toEqual({ AND: [{ id: { gt: 0 } }, {}] });
    });
  });
});
