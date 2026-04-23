import assert from 'node:assert';

/**
 * Math utility functions.
 */
export class MathUtil {
  /**
   * Rounds a number to the nearest multiple of n.
   * @param {number} value The number to round.
   * @param {number} n The multiple to round to.
   * @returns {number} The rounded number.
   */
  public static roundToNearest(value: number, n: number): number {
    assert(n != 0, 'n must be non-zero');
    return Math.round(value / n) * n;
  }
}
