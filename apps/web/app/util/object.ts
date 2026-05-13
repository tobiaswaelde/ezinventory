/**
 * Utility class for object manipulation.
 */
export class ObjectUtil {
  /**
   * Parses a JSON path string into an array of keys.
   * @param {string} path The JSON path string (e.g., '$.a.b[0].c')
   * @returns {(string|number)[]} An array of keys (e.g., ['a', 'b', 0, 'c'])
   */
  public static parseJsonPath(path: string): (string | number)[] {
    // return path
    //   .replace(/^\$\./, '')
    //   .replace(/\[(\d+)\]/g, '.$1')
    //   .split('.')
    //   .map((k) => (k.match(/^\d+$/) ? Number(k) : k));
    return path
      .replace(/^\$\./, '')
      .replace(/\[(\d+)\]/g, '.$1')
      .split('.')
      .map((k) => (k === '*' ? '*' : /^\d+$/.test(k) ? Number(k) : k));
  }

  /**
   * Retrieves the value from an object based on the provided keys.
   * @param {any} obj The object to retrieve the value from
   * @param {(string|number)[]} keys An array of keys representing the path to the value
   * @returns {any} The retrieved value
   */
  public static getValue(obj: any, keys: (string | number)[]) {
    return keys.reduce((acc, key) => acc?.[key], obj);
  }

  /**
   * Sets a value in an object based on the provided keys.
   * @param {any} obj The object to set the value in
   * @param {(string|number)[]} keys An array of keys representing the path to set the value
   * @param {any} value The value to set
   */
  public static setValue(obj: any, keys: (string | number)[], value: any) {
    let current = obj;

    keys.forEach((key, i) => {
      if (i === keys.length - 1) {
        current[key] = value;
        return;
      }

      if (!(key in current)) {
        current[key] = typeof keys[i + 1] === 'number' ? [] : {};
      }

      current = current[key];
    });
  }

  /**
   * Unflattens an object with dot notation keys into a nested object.
   * @param {Record<string, any>} obj The object to unflatten
   * @param {string} separator The separator used in the keys (default is `'.'`)
   * @returns {Record<string, any>} The unflattened object
   */
  public static unflatten(obj: Record<string, any>, separator: string = '.'): Record<string, any> {
    const result: Record<string, any> = {};

    for (const key in obj) {
      const parts = key.split(separator);
      let current = result;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];

        // If we are at the last part (e.g., 'firstname' in 'user.firstname'), assign the value
        if (i === parts.length - 1) {
          current[part] = obj[key];
        } else {
          // Otherwise, create the object if it doesn't exist and move deeper
          current[part] = current[part] || {};
          current = current[part];
        }
      }
    }

    return result;
  }

  /**
   * Splits an array into groups based on a specified key and value. Whenever an item with the specified key equal to the given value is encountered, a new group is started.
   * For example, if you have an array of log entries and want to split them into groups whenever a log entry with level 'error' is encountered, you can use this function with key='level' and value='error'.
   * @template T The type of items in the array
   * @template K The type of the key to split by (must be a key of T)
   * @param {T[]} array The array to split into groups
   * @param {K} key The key to split the array by
   * @param {T[K]} value The value of the key to split the array by
   * @returns {T[][]} An array of groups, where each group is an array of items from the original array that were split based on the specified key and value
   * @example
   * const logs = [
   *   { message: 'Info 1', level: 'info' },
   *   { message: 'Error 1', level: 'error' },
   *   { message: 'Info 2', level: 'info' },
   *   { message: 'Error 2', level: 'error' },
   *   { message: 'Info 3', level: 'info' },
   * ];
   * const groups = ObjectUtil.splitByKey(logs, 'level', 'error');
   * // groups will be:
   * // [
   * //   [{ message: 'Info 1', level: 'info' }],
   * //   [{ message: 'Info 2', level: 'info' }],
   * //   [{ message: 'Info 3', level: 'info' }],
   * // ]
   */
  public static splitByKey<T, K extends keyof T>(array: T[], key: K, value: T[K]): T[][] {
    const groups: T[][] = [];
    let currentGroup: T[] = [];

    for (const item of array) {
      if (item[key] === value) {
        groups.push(currentGroup);
        currentGroup = [];
      } else {
        currentGroup.push(item);
      }
    }

    // Push the last group if any
    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    return groups;
  }
}
