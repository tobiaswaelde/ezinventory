import { FieldsParser } from '~/lib/fields/fields-parser';
import { FieldsProjector } from '~/lib/fields/fields-projector';
import { FieldsValidator } from '~/lib/fields/fields-validator';
import { FieldSchema, FieldsProjection } from '~/lib/fields/types';

/**
 * High-level facade to parse, validate and apply `fields` projections.
 */
export class Fields {
  /**
   * Parse and validate a raw `fields` value.
   *
   * @param {unknown} rawFields Raw query parameter.
   * @param {FieldSchema} schema DTO field schema.
   * @param {{
   *   allowNested?: boolean;
   *   include?: unknown;
   *   requireIncludeForRelations?: boolean;
   * }} [options] Validation options.
   * @return {FieldsProjection | undefined} Parsed projection or undefined when not provided.
   */
  static parseAndValidate(
    rawFields: unknown,
    schema: FieldSchema,
    options?: {
      allowNested?: boolean;
      include?: unknown;
      requireIncludeForRelations?: boolean;
    },
  ): FieldsProjection | undefined {
    const projection = FieldsParser.parse(rawFields);
    if (!projection) {
      return undefined;
    }

    FieldsValidator.validateProjection(projection, schema);

    if (options?.allowNested === false) {
      FieldsValidator.validateNoNestedSelection(projection);
    }

    if (options?.requireIncludeForRelations) {
      FieldsValidator.validateIncludeRequirements(projection, schema, options.include);
    }

    return projection;
  }

  /**
   * Apply projection to a value.
   *
   * @param {T} value Source value.
   * @param {FieldsProjection} [projection] Parsed projection tree.
   * @return {T} Projected value.
   */
  static project<T>(value: T, projection?: FieldsProjection): T {
    return FieldsProjector.project(value, projection);
  }
}
