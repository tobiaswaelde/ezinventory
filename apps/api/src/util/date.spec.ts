import { DateUtil } from '~/util/date';

describe('DateUtil.getDaysBetween', () => {
  it('returns a single day when start equals end', () => {
    const result = DateUtil.getDaysBetween('2024-01-01', '2024-01-01');
    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(Date);
  });

  it('returns all days in a range', () => {
    const result = DateUtil.getDaysBetween('2024-01-01', '2024-01-03');
    expect(result).toHaveLength(3);
  });

  it('returns dates in ascending order', () => {
    const result = DateUtil.getDaysBetween('2024-03-01', '2024-03-05');
    expect(result).toHaveLength(5);
    for (let i = 1; i < result.length; i++) {
      expect(result[i].getTime()).toBeGreaterThan(result[i - 1].getTime());
    }
  });

  it('crosses month boundaries', () => {
    const result = DateUtil.getDaysBetween('2024-01-30', '2024-02-02');
    expect(result).toHaveLength(4);
  });

  it('crosses year boundaries', () => {
    const result = DateUtil.getDaysBetween('2023-12-30', '2024-01-02');
    expect(result).toHaveLength(4);
  });

  it('accepts Date objects as input', () => {
    const start = new Date('2024-06-01');
    const end = new Date('2024-06-03');
    const result = DateUtil.getDaysBetween(start, end);
    expect(result).toHaveLength(3);
  });

  it('returns empty array when start is after end', () => {
    const result = DateUtil.getDaysBetween('2024-01-10', '2024-01-05');
    expect(result).toHaveLength(0);
  });
});
