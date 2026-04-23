import 'reflect-metadata';
import { FieldSchema, relation } from '~/lib/fields/types';

type DtoClass = { new (...args: any[]): any };

const SWAGGER_PROPERTIES_ARRAY = 'swagger/apiModelPropertiesArray';
const SWAGGER_PROPERTY = 'swagger/apiModelProperties';

/**
 * Return DTO field names based on Swagger metadata decorators.
 */
export function getDtoFields(dtoClass: DtoClass): string[] {
  const fields = Reflect.getMetadata(SWAGGER_PROPERTIES_ARRAY, dtoClass.prototype) ?? [];
  return fields.map((x: string) => x.replace(':', ''));
}

function resolvePropertyType(dtoClass: DtoClass, field: string): any {
  const swaggerProperty = Reflect.getMetadata(SWAGGER_PROPERTY, dtoClass.prototype, field);

  let resolvedType: any;
  const swaggerType = swaggerProperty?.type;
  if (typeof swaggerType === 'function') {
    try {
      resolvedType = swaggerType();
    } catch {
      resolvedType = swaggerType;
    }
  } else {
    resolvedType = swaggerType;
  }

  if (Array.isArray(resolvedType) && resolvedType.length === 1) {
    resolvedType = resolvedType[0];
  }

  if (typeof resolvedType === 'undefined') {
    resolvedType = Reflect.getMetadata('design:type', dtoClass.prototype, field);
  }

  return resolvedType;
}

function isDtoClass(value: unknown): value is DtoClass {
  if (typeof value !== 'function') {
    return false;
  }

  const fields = Reflect.getMetadata(SWAGGER_PROPERTIES_ARRAY, value.prototype);
  return Array.isArray(fields) && fields.length > 0;
}

/**
 * Build a FieldSchema from a DTO class using Swagger metadata.
 * Nested DTO properties become relation fields.
 */
export function buildFieldSchemaFromDto(
  dtoClass: DtoClass,
  visited = new Set<DtoClass>(),
): FieldSchema {
  const schema: FieldSchema = {};

  for (const field of getDtoFields(dtoClass)) {
    const fieldType = resolvePropertyType(dtoClass, field);

    if (isDtoClass(fieldType)) {
      if (visited.has(fieldType)) {
        schema[field] = relation({});
      } else {
        const nextVisited = new Set(visited);
        nextVisited.add(fieldType);
        schema[field] = relation(buildFieldSchemaFromDto(fieldType, nextVisited));
      }
    } else {
      schema[field] = true;
    }
  }

  return schema;
}
