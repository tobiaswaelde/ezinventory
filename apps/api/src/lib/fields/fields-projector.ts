import { FieldsProjection } from '~/lib/fields/types';

/**
 * Applies a validated projection tree to objects/arrays.
 */
export class FieldsProjector {
  /**
   * Project any value to the requested shape.
   *
   * @param {T} value Source value.
   * @param {FieldsProjection} [projection] Requested fields tree.
   * @return {T} Projected value.
   */
  static project<T = any>(value: T, projection?: FieldsProjection): T {
    if (!projection) {
      return value;
    }

    return this.projectInternal(value, projection) as T;
  }

  /**
   * Recursive projection implementation.
   * @param {any} value Current source value.
   * @param {FieldsProjection | true} projection Projection node.
   * @return {any} Projected value for current node.
   */
  private static projectInternal(value: any, projection: FieldsProjection | true): any {
    if (projection === true) {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.projectInternal(item, projection));
    }

    if (value === null || typeof value === 'undefined') {
      return value;
    }

    if (typeof value !== 'object') {
      return value;
    }

    const out: Record<string, any> = {};
    for (const key of Object.keys(projection)) {
      const childProjection = projection[key];
      out[key] = this.projectInternal((value as Record<string, any>)[key], childProjection);
    }

    return out;
  }
}
