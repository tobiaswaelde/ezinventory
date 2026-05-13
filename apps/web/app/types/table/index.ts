import type { TableColumn } from '#ui/types';

type Primitive = string | number | boolean | bigint | symbol | null | undefined | Date;

type DotPath<T> = {
  [K in keyof T & string]: T[K] extends Primitive
    ? K
    : T[K] extends Array<infer U>
      ? K | `${K}.${DotPath<U>}`
      : K | `${K}.${DotPath<T[K]>}`;
}[keyof T & string];

export type ColumnDefinition<T> = TableColumn<T> & {
  id: DotPath<T> | 'actions';
  accessorKey?: DotPath<T> | 'actions';
  fields?: string[];
};

export type TableProps<T> = {
  columns: ColumnDefinition<T>[];
  items: T[];
  loading?: boolean;
  page: number;
  itemsPerPage: number;
};
