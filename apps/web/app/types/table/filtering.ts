import type { SelectMenuProps, SelectProps } from '#ui/types';

export enum FilterFieldType {
  Boolean = 'boolean',
  Number = 'number',
  Enum = 'enum',
  Select = 'select',
}
export enum FilteringMode {
  Intersect = 'AND',
  Union = 'OR',
}
export enum FilteringFieldOperator {
  In = 'in',
  NotIn = 'notIn',
  Equals = 'equals',
  NotEquals = 'not',
  LessThan = 'lt',
  LessThanOrEqual = 'lte',
  GreaterThan = 'gt',
  GreaterThanOrEqual = 'gte',
}

export type FilterFieldBase = {
  value: string;
  label: string;
};

export type FilterFieldBoolean = FilterFieldBase & {
  type: FilterFieldType.Boolean;
};
export type FilterFieldNumber = FilterFieldBase & {
  type: FilterFieldType.Number;
};
export type FilterFieldEnum = FilterFieldBase & {
  type: FilterFieldType.Enum;
  enumName: string;
  enum: any;
  customSelect?: Component<SelectProps> | Component<SelectMenuProps>;
};
export type FilterFieldSelect = FilterFieldBase & {
  type: FilterFieldType.Select;
  select: Component<SelectProps> | Component<SelectMenuProps>;
};

export type FilterField = FilterFieldBoolean | FilterFieldNumber | FilterFieldEnum | FilterFieldSelect;

export type FilteringField = {
  id: string;
  field: string;
  type: FilterFieldType;
  operator?: FilteringFieldOperator;
  value?: string | string[] | boolean | number;
};
export type Filtering = {
  operator: FilteringMode;
  filters: FilteringField[];
};
