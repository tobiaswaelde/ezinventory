/**
 * Utility class for objects.
 */
export class ObjectUtil {
  //#region helper functions
  /**
   * Checks if the given value can be parsed to an array.
   * @param {any} obj The value to check.
   * @returns `true` if the value can be parsed to an array; `false` otherwise.
   */
  public static isArray(obj: any): boolean {
    return Array.isArray(obj);
  }

  /**
   * Checks if the given value can be parsed to an object.
   * @param {any} obj The value to check.
   * @returns `true` if the value can be parsed to an object; `false` otherwise.
   */
  public static isObject(obj: any): boolean {
    return typeof obj === 'object';
  }

  /**
   * Checks if the given value can be parsed to a number.
   * @param {any} obj The value to check.
   * @returns `true` if the value can be parsed to a number; `false` otherwise.
   */
  public static isNumber(obj: any): boolean {
    return typeof obj === 'number' || !Number.isNaN(Number(obj));
  }

  /**
   * Checks if the given value can be parsed to a boolean.
   * @param {any} obj The value to check.
   * @returns `true` if the value can be parsed to a boolean; `false` otherwise.
   */
  public static isBoolean(obj: any): boolean {
    if (
      typeof obj === 'boolean' ||
      obj === 'true' ||
      obj === 'false' ||
      obj === true ||
      obj === false
    ) {
      return true;
    }

    return false;
  }
  //#endregion

  /**
   * Parses an object which values contains of strings.
   * @param {any} obj The object to parse.
   * @returns {any} The parsed object.
   * @example
   * ```
   * const obj = {
   *   page: '1',
   *   perPage: '2',
   *   sort: [
   *     { 'user.name': 'asc' } },
   *     { title: 'asc' }
   *   ],
   *   include: {
   *     albums: {
   *       include: {
   *         photos: 'true'
   *       }
   *     }
   *   }
   * }
   * console.log(ObjectUtil.parse(obj));
   *
   * // Result:
   * {
   *   page: 1,
   *   perPage: 2,
   *   sort: [
   *     { user: { name: 'asc' } },
   *     { title: 'asc' }
   *   ],
   *   include: {
   *     albums: {
   *       include: {
   *         photos: true
   *       }
   *     }
   *   }
   * }
   * ```
   */
  public static parse(obj: any): any {
    if (obj === 'null') {
      return null;
    }

    // array
    if (ObjectUtil.isArray(obj)) {
      return obj.map(ObjectUtil.parse);
    }
    // object
    else if (ObjectUtil.isObject(obj)) {
      return ObjectUtil.parseFromObject(obj);
    }
    // boolean
    else if (ObjectUtil.isBoolean(obj)) {
      return ObjectUtil.parseBoolean(obj);
    }
    // number
    else if (ObjectUtil.isNumber(obj)) {
      return Number(obj);
    }

    // undefined
    if (typeof obj === 'undefined') {
      return undefined;
    }

    // string
    return String(obj);
  }

  /**
   * Returns an object according to the given path.
   * @param {string} path The path of the value.
   * @param {any} value The value.
   * @returns An object with the value at the given path in the object.
   * @example
   * ```
   * const obj = ObjectUtil.createFromPath('user.name', 'Tobias');
   * console.log(obj);
   *
   * // Result
   * { user: { name: 'Tobias' } }
   * ```
   */
  private static createFromPath(path: string, value: any): any {
    // check if the path is nested
    if (path.includes('.')) {
      const [root] = path.split('.', 1);
      const subpath = path.substring(path.indexOf('.') + 1);
      // recursively generate nested object
      return { [root]: ObjectUtil.createFromPath(subpath, value) };
    }

    // if the path is no longer nested, return the value
    return { [path]: value };
  }

  /**
   * Parses an object from an unparsed object.
   * @param {any} obj The unparsed object.
   * @returns {any} The parsed object.
   * @example
   * ```
   * const obj = { number: '123', boolean: 'true' }
   * ObjectUtil.parseFromObject(obj);
   *
   * // Result:
   * { number: 123, boolean: true }
   * ```
   */
  private static parseFromObject(obj: any): any {
    if (obj === null) return null;

    const o: any = {};
    for (const key of Object.keys(obj)) {
      if (key.includes('.')) {
        Object.assign(o, ObjectUtil.createFromPath(key, ObjectUtil.parse(obj[key])));
      } else {
        o[key] = ObjectUtil.parse(obj[key]);
      }
    }
    return o;
  }

  /**
   * Parse value to boolean.
   * @param {any} value The value to parse.
   * @returns `true` if value is truish (`true`, `'true'`, `1`, `'1'`, `'on'`, `'yes'`); `false` otherwise.
   */
  private static parseBoolean(value: any): boolean {
    switch (value) {
      case true:
      case 'true':
      case 'on':
      case 'yes':
        return true;
      default:
        return false;
    }
  }
}
