import { BadRequestException } from '@nestjs/common';
import { __FieldsParserTest, FieldsParser } from '~/lib/fields/fields-parser';
import { FieldsProjector } from '~/lib/fields/fields-projector';
import { FieldsValidator } from '~/lib/fields/fields-validator';
import { FieldSchema, relation } from '~/lib/fields/types';

describe('Fields utilities', () => {
  describe('FieldsParser', () => {
    it('parses top-level and nested fields', () => {
      const parsed = FieldsParser.parse('id,email,profile{id,firstname}');
      expect(parsed).toEqual({
        id: true,
        email: true,
        profile: {
          id: true,
          firstname: true,
        },
      });
    });

    it('throws on invalid syntax with details', () => {
      expect(() => FieldsParser.parse('id,email{')).toThrow(BadRequestException);
    });

    it('handles parser edge cases and syntax errors', () => {
      expect(() => FieldsParser.parse('   ')).toThrow(BadRequestException);
      expect(() => FieldsParser.parse('id email')).toThrow(BadRequestException);
      expect(() => FieldsParser.parse('1invalid')).toThrow(BadRequestException);
      expect(() => FieldsParser.parse('id,profile{firstname} trailing')).toThrow(
        BadRequestException,
      );
      expect(() => FieldsParser.parse('profile{id]')).toThrow(BadRequestException);
      expect(() => FieldsParser.parse('id}')).toThrow(BadRequestException);
      expect(() => FieldsParser.parse('profile{id')).toThrow(BadRequestException);

      expect(FieldsParser.parse('profile{id},profile{firstname}')).toEqual({
        profile: { id: true, firstname: true },
      });
      expect(FieldsParser.parse('id,id{nested}')).toEqual({ id: true });
      expect(FieldsParser.parse(null)).toBeUndefined();

      expect(() => FieldsParser.parse({})).toThrow(BadRequestException);
    });

    it('covers parser internal end-of-input guard', () => {
      const parser = new __FieldsParserTest.Parser('id') as any;
      parser.pos = parser.input.length;

      expect(() => parser.parseName()).toThrow(BadRequestException);
    });
  });

  describe('FieldsValidator', () => {
    const schema: FieldSchema = {
      id: true,
      email: true,
      profile: relation({
        id: true,
        organization: relation({
          id: true,
        }),
        firstname: true,
      }),
    };

    it('throws for unknown fields', () => {
      expect(() => FieldsValidator.validateProjection({ unknown: true }, schema)).toThrow(
        BadRequestException,
      );
    });

    it('throws for missing include on relation field', () => {
      expect(() =>
        FieldsValidator.validateIncludeRequirements(
          {
            profile: {
              id: true,
            },
          },
          schema,
          {},
        ),
      ).toThrow(BadRequestException);
    });

    it('accepts nested fields when include exists', () => {
      expect(() =>
        FieldsValidator.validateIncludeRequirements(
          {
            profile: {
              id: true,
            },
          },
          schema,
          { profile: true },
        ),
      ).not.toThrow();
    });

    it('covers nested selection and include validation edge branches', () => {
      expect(() =>
        FieldsValidator.validateProjection(
          {
            id: {
              nested: true,
            },
          } as never,
          schema,
        ),
      ).toThrow(BadRequestException);

      expect(() =>
        FieldsValidator.validateNoNestedSelection({
          profile: {
            id: true,
          },
        }),
      ).toThrow(BadRequestException);

      expect(() =>
        FieldsValidator.validateIncludeRequirements(
          {
            profile: true,
          },
          schema,
          {
            profile: true,
          },
        ),
      ).not.toThrow();

      expect(() =>
        FieldsValidator.validateIncludeRequirements(
          {
            profile: {
              id: true,
            },
          },
          schema,
          {
            profile: {
              foo: 'bar',
            },
          },
        ),
      ).not.toThrow();

      expect(() =>
        FieldsValidator.validateProjection(
          {
            profile: {
              organization: {
                id: true,
              },
            },
          },
          schema,
        ),
      ).not.toThrow();
    });
  });

  describe('FieldsProjector', () => {
    it('projects nested arrays and preserves null values', () => {
      const result = FieldsProjector.project(
        {
          id: '1',
          profile: { id: 'p1', firstname: 'John', lastname: 'Doe' },
          organizations: [{ organizationId: 'o1', roles: ['OWNER'] }],
        },
        {
          id: true,
          profile: { id: true },
          organizations: { organizationId: true },
        },
      );

      expect(result).toEqual({
        id: '1',
        profile: { id: 'p1' },
        organizations: [{ organizationId: 'o1' }],
      });
    });

    it('returns passthrough values for undefined projection, nulls and primitives', () => {
      expect(FieldsProjector.project({ id: '1' }, undefined)).toEqual({ id: '1' });
      expect(FieldsProjector.project(null as never, { id: true })).toBeNull();
      expect(FieldsProjector.project('value' as never, { id: true })).toBe('value');
    });
  });
});
