export type TableEvents = {
  'table:initialized': { tableName: string };
  'table:refresh': void;
  'table:refreshed': { tableName: string };
  'table:update-item-count': { tableName: string; itemCount: number };
};
