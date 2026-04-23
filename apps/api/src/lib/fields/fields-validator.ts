import { BadRequestException } from '@nestjs/common';
import {
  FieldSchema,
  FieldSchemaNode,
  FieldsProjection,
  isRelationSchemaNode,
} from '~/lib/fields/types';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Build a standardized bad request payload for fields validation.
 * @param {string} details Validation error details.
 * @param {string} [path] Field path that caused the error.
 * @return {BadRequestException} Structured bad request exception.
 */
function badRequest(details: string, path?: string) {
  return new BadRequestException({
    message: 'Invalid fields query parameter',
    details,
    path,
  });
}

/**
 * Read one relation node from include data.
 * @param {any} include Include query value.
 * @param {string} key Relation key.
 * @return {any} Include child value.
 */
function getIncludeChild(include: any, key: string) {
  if (!isPlainObject(include)) {
    return undefined;
  }

  return include[key];
}

/**
 * Detect whether a projection contains any nested relation selections.
 * @param {FieldsProjection} projection Projection tree.
 * @param {FieldSchema} schema Field schema.
 * @return {boolean} True when nested relation selections are present.
 */
function hasNestedRelationSelection(projection: FieldsProjection, schema: FieldSchema): boolean {
  for (const key of Object.keys(projection)) {
    const projectionNode = projection[key];
    const schemaNode = schema[key];

    if (!schemaNode || !isRelationSchemaNode(schemaNode) || projectionNode === true) {
      continue;
    }

    return true;
  }

  return false;
}

/**
 * Normalize include child representation for nested traversal.
 * @param {any} includeChild Child include node.
 * @return {any} Normalized nested include context.
 */
function getNestedIncludeContext(includeChild: any) {
  if (includeChild === true) {
    return true;
  }

  if (!isPlainObject(includeChild)) {
    return undefined;
  }

  if (isPlainObject((includeChild as any).include)) {
    return (includeChild as any).include;
  }

  return includeChild;
}

/**
 * Validates parsed field projections against DTO schemas and include rules.
 */
export class FieldsValidator {
  /**
   * Validate field names and nesting against schema.
   *
   * @param {FieldsProjection} projection Parsed fields projection.
   * @param {FieldSchema} schema Allowed DTO schema.
   * @param {string} [path] Internal traversal path.
   * @return {void}
   * @throws {BadRequestException} If unknown field or invalid nesting is used.
   */
  static validateProjection(projection: FieldsProjection, schema: FieldSchema, path = '') {
    for (const key of Object.keys(projection)) {
      const node = schema[key];
      const fieldPath = path ? `${path}.${key}` : key;

      if (!node) {
        throw badRequest(`unknown field "${key}"`, fieldPath);
      }

      const projectionNode = projection[key];
      if (projectionNode !== true) {
        if (!isRelationSchemaNode(node)) {
          throw badRequest(`field "${key}" does not support nested selections`, fieldPath);
        }

        this.validateProjection(projectionNode, node.fields, fieldPath);
      }
    }
  }

  /**
   * Ensure projection only contains top-level fields.
   *
   * @param {FieldsProjection} projection Parsed fields projection.
   * @return {void}
   * @throws {BadRequestException} If nested selections are present.
   */
  static validateNoNestedSelection(projection: FieldsProjection) {
    for (const key of Object.keys(projection)) {
      if (projection[key] !== true) {
        throw badRequest(
          `nested selection is not supported on this endpoint (field "${key}")`,
          key,
        );
      }
    }
  }

  /**
   * Validate that all relation selections are backed by explicit include entries.
   *
   * @param {FieldsProjection} projection Parsed fields projection.
   * @param {FieldSchema} schema Allowed DTO schema.
   * @param {unknown} include Include query object.
   * @param {string} [path] Internal traversal path.
   * @return {void}
   * @throws {BadRequestException} If required include values are missing.
   */
  static validateIncludeRequirements(
    projection: FieldsProjection,
    schema: FieldSchema,
    include: unknown,
    path = '',
  ) {
    for (const key of Object.keys(projection)) {
      const node: FieldSchemaNode = schema[key];
      const projectionNode = projection[key];

      if (!isRelationSchemaNode(node)) {
        continue;
      }

      const fieldPath = path ? `${path}.${key}` : key;
      const includeChild = getIncludeChild(include, key);

      if (includeChild === undefined) {
        throw badRequest(
          `relation field "${fieldPath}" requires include (missing include.${fieldPath})`,
          fieldPath,
        );
      }

      if (projectionNode === true) {
        continue;
      }

      const nestedInclude = getNestedIncludeContext(includeChild);
      if (nestedInclude === true && hasNestedRelationSelection(projectionNode, node.fields)) {
        throw badRequest(
          `nested relation selection for "${fieldPath}" requires explicit nested include`,
          fieldPath,
        );
      }

      this.validateIncludeRequirements(
        projectionNode,
        node.fields,
        nestedInclude === true ? undefined : nestedInclude,
        fieldPath,
      );
    }
  }
}
