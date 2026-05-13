import type { SortingState } from '@tanstack/table-core';
import { ObjectUtil } from '~/util/object';

/**
 * Utility class for handling query-related logic, such as converting filter and sorting states into query strings that can be used in API requests.
 */
export class QueryUtil {
  /**
   * Converts a filter object into a string that can be used in API queries. Unflattens the filter object and then stringifies it.
   * @param {any} filter The filter object to convert, which may be a flattened representation of the actual filter conditions.
   * @returns {string | undefined} A stringified version of the unflattened filter object, or undefined if the input filter is falsy.
   */
  public static getFilterString(filter?: any): string | undefined {
    if (!filter) return undefined;
    const unflattened = ObjectUtil.unflatten(filter);
    return JSON.stringify(unflattened);
  }

  /**
   * Converts a sorting state into a string that can be used in API queries. Unflattens the sorting state and then stringifies it.
   * @param {SortingState} sorting The sorting state to convert, which is an array of sorting conditions with field IDs and sort directions.
   * @returns {string | undefined} A stringified version of the unflattened sorting state, or undefined if the input sorting state is falsy.
   */
  public static getSortString(sorting?: SortingState): string | undefined {
    if (!sorting) return undefined;
    const unflattened = sorting.map((s) => ObjectUtil.unflatten({ [s.id]: s.desc ? 'desc' : 'asc' }));
    return JSON.stringify(unflattened);
  }
}
