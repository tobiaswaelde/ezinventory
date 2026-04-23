/**
 * Parsed projection tree from the `fields` query parameter.
 * `true` means include the full field value.
 */
export interface FieldsProjection {
  [key: string]: FieldsProjection | true;
}

/**
 * One schema node: either scalar (`true`) or relation with nested schema.
 */
export type FieldSchemaNode =
  | true
  | {
      relation: true;
      fields: FieldSchema;
    };

/**
 * DTO schema used to validate `fields` projections.
 */
export type FieldSchema = Record<string, FieldSchemaNode>;

/**
 * Create a relation schema node.
 * @param {FieldSchema} fields Nested field schema.
 * @return {FieldSchemaNode} Relation schema node.
 */
export function relation(fields: FieldSchema): FieldSchemaNode {
  return { relation: true, fields };
}

/**
 * Type guard for relation schema nodes.
 * @param {FieldSchemaNode} node Schema node to check.
 * @return {boolean} True when node is a relation node.
 */
export function isRelationSchemaNode(
  node: FieldSchemaNode,
): node is { relation: true; fields: FieldSchema } {
  return node !== true;
}
