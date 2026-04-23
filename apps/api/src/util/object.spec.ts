import { ObjectUtil } from '~/util/object';

describe('ObjectUtil', () => {
  describe('isArray', () => {
    it('returns true for arrays', () => {
      expect(ObjectUtil.isArray([])).toBe(true);
      expect(ObjectUtil.isArray([1, 2, 3])).toBe(true);
    });

    it('returns false for non-arrays', () => {
      expect(ObjectUtil.isArray({})).toBe(false);
      expect(ObjectUtil.isArray('string')).toBe(false);
      expect(ObjectUtil.isArray(42)).toBe(false);
      expect(ObjectUtil.isArray(null)).toBe(false);
    });
  });

  describe('isObject', () => {
    it('returns true for objects and arrays', () => {
      expect(ObjectUtil.isObject({})).toBe(true);
      expect(ObjectUtil.isObject([])).toBe(true);
      expect(ObjectUtil.isObject(null)).toBe(true); // typeof null === 'object'
    });

    it('returns false for primitives', () => {
      expect(ObjectUtil.isObject('string')).toBe(false);
      expect(ObjectUtil.isObject(42)).toBe(false);
      expect(ObjectUtil.isObject(true)).toBe(false);
    });
  });

  describe('isNumber', () => {
    it('returns true for numbers and numeric strings', () => {
      expect(ObjectUtil.isNumber(42)).toBe(true);
      expect(ObjectUtil.isNumber('42')).toBe(true);
      expect(ObjectUtil.isNumber('3.14')).toBe(true);
      expect(ObjectUtil.isNumber(0)).toBe(true);
      expect(ObjectUtil.isNumber('0')).toBe(true);
    });

    it('returns false for non-numeric values', () => {
      expect(ObjectUtil.isNumber('hello')).toBe(false);
    });
  });

  describe('isBoolean', () => {
    it('returns true for boolean values and truthy/falsy strings', () => {
      expect(ObjectUtil.isBoolean(true)).toBe(true);
      expect(ObjectUtil.isBoolean(false)).toBe(true);
      expect(ObjectUtil.isBoolean('true')).toBe(true);
      expect(ObjectUtil.isBoolean('false')).toBe(true);
    });

    it('returns false for non-boolean values', () => {
      expect(ObjectUtil.isBoolean('yes')).toBe(false);
      expect(ObjectUtil.isBoolean(1)).toBe(false);
      expect(ObjectUtil.isBoolean(0)).toBe(false);
      expect(ObjectUtil.isBoolean('on')).toBe(false);
    });
  });

  describe('parse', () => {
    it('returns null for the string "null"', () => {
      expect(ObjectUtil.parse('null')).toBeNull();
    });

    it('returns undefined for undefined input', () => {
      expect(ObjectUtil.parse(undefined)).toBeUndefined();
    });

    it('parses numeric strings to numbers', () => {
      expect(ObjectUtil.parse('42')).toBe(42);
      expect(ObjectUtil.parse('3.14')).toBe(3.14);
      expect(ObjectUtil.parse('0')).toBe(0);
    });

    it('parses boolean string "true" to true', () => {
      expect(ObjectUtil.parse('true')).toBe(true);
    });

    it('parses boolean string "false" to false', () => {
      expect(ObjectUtil.parse('false')).toBe(false);
    });

    it('keeps "on" and "yes" as strings (isBoolean only recognises "true"/"false")', () => {
      // parseBoolean handles 'on'/'yes', but parse() only calls parseBoolean
      // when isBoolean() returns true — which only matches 'true'/'false'/boolean literals.
      expect(ObjectUtil.parse('on')).toBe('on');
      expect(ObjectUtil.parse('yes')).toBe('yes');
    });

    it('keeps plain strings as strings', () => {
      expect(ObjectUtil.parse('hello')).toBe('hello');
      expect(ObjectUtil.parse('asc')).toBe('asc');
    });

    it('recursively parses object values', () => {
      const result = ObjectUtil.parse({ page: '1', perPage: '10', active: 'true' });
      expect(result).toEqual({ page: 1, perPage: 10, active: true });
    });

    it('handles null values inside objects', () => {
      expect(ObjectUtil.parse(null)).toBeNull();
    });

    it('recursively parses array elements', () => {
      const result = ObjectUtil.parse(['1', '2', 'true']);
      expect(result).toEqual([1, 2, true]);
    });

    it('expands dot-notation keys into nested objects', () => {
      const result = ObjectUtil.parse({ 'user.name': 'asc' });
      expect(result).toEqual({ user: { name: 'asc' } });
    });

    it('expands deeply nested dot-notation keys', () => {
      const result = ObjectUtil.parse({ 'a.b.c': '1' });
      expect(result).toEqual({ a: { b: { c: 1 } } });
    });

    it('parses complex nested object matching the JSDoc example', () => {
      const input = {
        page: '1',
        perPage: '2',
        sort: [{ 'user.name': 'asc' }, { title: 'asc' }],
        include: {
          albums: {
            include: {
              photos: 'true',
            },
          },
        },
      };

      const result = ObjectUtil.parse(input);
      expect(result.page).toBe(1);
      expect(result.perPage).toBe(2);
      expect(result.sort[0]).toEqual({ user: { name: 'asc' } });
      expect(result.sort[1]).toEqual({ title: 'asc' });
      expect(result.include.albums.include.photos).toBe(true);
    });
  });
});
