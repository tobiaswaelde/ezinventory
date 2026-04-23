import { MathUtil } from '~/util/math';

describe('MathUtil.roundToNearest', () => {
  it('rounds to nearest 5', () => {
    expect(MathUtil.roundToNearest(12, 5)).toBe(10);
    expect(MathUtil.roundToNearest(13, 5)).toBe(15);
    expect(MathUtil.roundToNearest(15, 5)).toBe(15);
  });

  it('rounds to nearest 10', () => {
    expect(MathUtil.roundToNearest(14, 10)).toBe(10);
    expect(MathUtil.roundToNearest(15, 10)).toBe(20);
    expect(MathUtil.roundToNearest(100, 10)).toBe(100);
  });

  it('rounds to nearest 1 (no-op)', () => {
    expect(MathUtil.roundToNearest(7, 1)).toBe(7);
    expect(MathUtil.roundToNearest(7.6, 1)).toBe(8);
  });

  it('handles negative values', () => {
    expect(MathUtil.roundToNearest(-12, 5)).toBe(-10);
    expect(MathUtil.roundToNearest(-13, 5)).toBe(-15);
  });

  it('throws when n is 0', () => {
    expect(() => MathUtil.roundToNearest(10, 0)).toThrow();
  });

  it('handles exact multiples', () => {
    expect(MathUtil.roundToNearest(30, 15)).toBe(30);
    expect(MathUtil.roundToNearest(0, 5)).toBe(0);
  });
});
