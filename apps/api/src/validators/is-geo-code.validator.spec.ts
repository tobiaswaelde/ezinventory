import { IsGeoCodeConstraint } from '~/validators/is-geo-code.validator';

const constraint = new IsGeoCodeConstraint();

const args = (property: string, object: Record<string, any>) => ({ property, object }) as any;

describe('IsGeoCodeConstraint', () => {
  describe('validate – stateCode', () => {
    it('returns true when countryCode is absent', () => {
      expect(constraint.validate('BY', args('stateCode', {}))).toBe(true);
    });

    it('returns true when stateCode is absent (optional)', () => {
      expect(constraint.validate(undefined, args('stateCode', { countryCode: 'DE' }))).toBe(true);
    });

    it('returns true for a valid state code', () => {
      // DE/BY (Bavaria) is always a valid German state
      expect(constraint.validate('BY', args('stateCode', { countryCode: 'DE' }))).toBe(true);
    });

    it('returns false for an invalid state code', () => {
      expect(constraint.validate('XX', args('stateCode', { countryCode: 'DE' }))).toBe(false);
    });
  });

  describe('validate – regionCode', () => {
    it('returns true when regionCode is absent (optional)', () => {
      expect(
        constraint.validate(undefined, args('regionCode', { countryCode: 'DE', stateCode: 'BY' })),
      ).toBe(true);
    });

    it('returns false when regionCode provided but stateCode missing', () => {
      expect(constraint.validate('AUGSBURG', args('regionCode', { countryCode: 'DE' }))).toBe(
        false,
      );
    });

    it('returns false for an unknown validation target', () => {
      // property is neither 'stateCode' nor 'regionCode'
      expect(constraint.validate('X', args('cityCode', { countryCode: 'DE' }))).toBe(false);
    });
  });

  describe('defaultMessage', () => {
    it('returns stateCode message', () => {
      const msg = constraint.defaultMessage(args('stateCode', { countryCode: 'DE' }) as any);
      expect(msg).toContain('State code');
    });

    it('returns regionCode message', () => {
      const msg = constraint.defaultMessage({
        ...args('regionCode', { countryCode: 'DE', stateCode: 'BY' }),
        value: 'X',
      } as any);
      expect(msg).toContain('Region code');
    });

    it('returns generic message for unknown property', () => {
      const msg = constraint.defaultMessage(args('cityCode', {}) as any);
      expect(msg).toContain('cityCode');
    });
  });
});
