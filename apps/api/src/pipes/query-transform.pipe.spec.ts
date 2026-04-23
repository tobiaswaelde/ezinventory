import { ArgumentMetadata } from '@nestjs/common';
import { QueryTransformPipe } from '~/pipes/query-transform.pipe';

describe('QueryTransformPipe', () => {
  let pipe: QueryTransformPipe;

  beforeEach(() => {
    pipe = new QueryTransformPipe();
  });

  const queryMeta: ArgumentMetadata = { type: 'query', metatype: undefined, data: undefined };
  const bodyMeta: ArgumentMetadata = { type: 'body', metatype: undefined, data: undefined };

  it('parses string numbers in query objects', () => {
    const result = pipe.transform({ page: '1', perPage: '10' }, queryMeta);
    expect(result.page).toBe(1);
    expect(result.perPage).toBe(10);
  });

  it('parses string booleans in query objects', () => {
    const result = pipe.transform({ active: 'true', archived: 'false' }, queryMeta);
    expect(result.active).toBe(true);
    expect(result.archived).toBe(false);
  });

  it('passes through non-query metadata untransformed', () => {
    const value = { someField: '42' };
    const result = pipe.transform(value, bodyMeta);
    expect(result).toEqual({ someField: '42' });
  });

  it('passes through non-object query values untransformed', () => {
    const result = pipe.transform('raw-string', queryMeta);
    expect(result).toBe('raw-string');
  });

  it('handles empty query object', () => {
    const result = pipe.transform({}, queryMeta);
    expect(result).toEqual({});
  });

  it('parses nested query objects (pre-parsed by Express)', () => {
    const value = { where: { status: 'OPEN', priority: '1' } };
    const result = pipe.transform(value, queryMeta);
    expect(result.where.status).toBe('OPEN');
    expect(result.where.priority).toBe(1);
  });

  it('keeps string values that are not numbers or booleans as strings', () => {
    const result = pipe.transform({ orderBy: 'createdAt', direction: 'asc' }, queryMeta);
    expect(result.orderBy).toBe('createdAt');
    expect(result.direction).toBe('asc');
  });
});
