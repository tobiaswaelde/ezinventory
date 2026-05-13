import {
  FilterFieldType,
  FilteringFieldOperator,
  FilteringMode,
  type FilterField,
  type Filtering,
  type FilteringField,
} from '~/types/table/filtering';

/**
 * Utility class for handling filtering logic in tables. Provides methods to convert filtering state into query objects.
 */
export class FilteringUtil {
  /**
   * Converts the filtering state and optional static filters into a single filter object that can be used in queries.
   * Combines dynamic filters based on the specified filtering operator (AND/OR) and includes any static filters.
   * @param {Filtering} filtering The current filtering state, including the operator and dynamic filters.
   * @param {any} staticFilters Optional static filters that should always be applied, regardless of the dynamic filtering state.
   * @returns {any} A filter object that combines the dynamic filters and static filters according to the specified logic, or undefined if no filters are applied.
   */
  public static getFilterObject(filtering: Filtering, staticFilters?: any) {
    const conditions: any[] = [];

    // include static filter from options
    if (staticFilters) {
      conditions.push(staticFilters);
    }

    // include dynamic filters from filtering object
    const filters = filtering.filters.filter((f) => f.value !== undefined);
    if (filters.length > 0) {
      const filterConditions: any[] = [];

      // loop through filters and convert to query conditions
      for (const f of filters) {
        if (f.type === FilterFieldType.Boolean) {
          filterConditions.push({ [f.field]: f.value });
        }
        //NOTE handle custom filtering types here

        // all remaining types can use operator-based filtering
        else {
          if (f.operator) {
            filterConditions.push({ [f.field]: { [f.operator]: f.value } });
          } else {
            filterConditions.push({ [f.field]: f.value });
          }
        }
      }

      // decide how to combine filter conditions based on filtering operator
      if (filtering.operator === FilteringMode.Intersect) {
        conditions.push(...filterConditions);
      } else if (filtering.operator === FilteringMode.Union) {
        conditions.push({ [filtering.operator]: filterConditions });
      }
    }

    // filter out any undefined or null values
    const AND = conditions.filter(Boolean);

    // return final filter object
    if (AND.length === 0) return undefined;
    else if (AND.length === 1) return AND[0];
    else return { AND: AND };
  }

  /**
   * Generates a new filtering field object based on the provided filter field definition. The generated filtering field includes a unique ID, the field name, type, and default operator and value based on the filter field type.
   * This method is used when adding a new filter condition to the filtering state, ensuring that the new filter is properly initialized according to its type.
   * @param {FilterField} field The filter field definition that specifies the field name, type, and other relevant information needed to create a new filtering field.
   * @returns {FilteringField} A new filtering field object initialized with default values based on the provided filter field definition, ready to be added to the filtering state.
   */
  public static getNewFilter(field: FilterField): FilteringField {
    const id = crypto.randomUUID();
    const type = field.type;

    const base = {
      id: id,
      field: field.value,
      type: type,
    };

    switch (type) {
      case FilterFieldType.Boolean:
        return {
          ...base,
          value: true,
        };
      case FilterFieldType.Enum:
      case FilterFieldType.Select:
        return {
          ...base,
          operator: FilteringFieldOperator.In,
          value: [],
        };
      case FilterFieldType.Number:
        return {
          ...base,
          operator: FilteringFieldOperator.Equals,
          value: 0,
        };

      default:
        return base;
    }
  }
}
