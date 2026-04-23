import { BadRequestException } from '@nestjs/common';
import { FieldsProjection } from '~/lib/fields/types';

/**
 * Stateful parser for the `fields` query parameter.
 * Supports a minimal nested selection subset: `a,b,c{d,e}`.
 */
class Parser {
  private readonly input: string;
  private pos = 0;

  /**
   * @param {string} input Raw fields string.
   */
  constructor(input: string) {
    this.input = input;
  }

  /**
   * Parse the full input into a projection tree.
   * @return {FieldsProjection} Parsed projection tree.
   * @throws {BadRequestException} If syntax is invalid.
   */
  parse(): FieldsProjection {
    this.skipWhitespace();

    if (!this.hasMore()) {
      throw this.error('fields cannot be empty');
    }

    const projection = this.parseSelectionList();

    this.skipWhitespace();
    if (this.hasMore()) {
      throw this.error(`unexpected token "${this.peek()}"`);
    }

    return projection;
  }

  /**
   * Parse a comma-separated selection list.
   * @return {FieldsProjection} Parsed selection set.
   */
  private parseSelectionList(): FieldsProjection {
    const selection: FieldsProjection = {};

    while (true) {
      this.skipWhitespace();

      if (!this.hasMore() || this.peek() === '}') {
        break;
      }

      const fieldName = this.parseName();
      this.skipWhitespace();

      let child: FieldsProjection | true = true;
      if (this.peek() === '{') {
        this.consume('{');
        child = this.parseSelectionList();
        this.skipWhitespace();
        this.consume('}');
      }

      const current = selection[fieldName];
      if (current === undefined) {
        selection[fieldName] = child;
      } else if (current !== true && child !== true) {
        selection[fieldName] = { ...current, ...child };
      }

      this.skipWhitespace();
      if (this.peek() === ',') {
        this.consume(',');
        continue;
      }

      if (!this.hasMore() || this.peek() === '}') {
        break;
      }

      throw this.error('expected comma or closing brace');
    }

    if (Object.keys(selection).length === 0) {
      throw this.error('selection set cannot be empty');
    }

    return selection;
  }

  /**
   * Parse one field identifier.
   * @return {string} Parsed field name.
   */
  private parseName(): string {
    if (!this.hasMore()) {
      throw this.error('unexpected end of input while reading field name');
    }

    const start = this.pos;
    const first = this.peek();
    if (!/[A-Za-z_]/.test(first)) {
      throw this.error(`invalid field start "${first}"`);
    }

    this.pos++;
    while (this.hasMore() && /[A-Za-z0-9_]/.test(this.peek())) {
      this.pos++;
    }

    return this.input.slice(start, this.pos);
  }

  /**
   * Advance parser position over whitespace.
   */
  private skipWhitespace() {
    while (this.hasMore() && /\s/.test(this.peek())) {
      this.pos++;
    }
  }

  private hasMore() {
    return this.pos < this.input.length;
  }

  /**
   * Read current character without consuming.
   */
  private peek() {
    return this.input[this.pos];
  }

  /**
   * Consume an expected token.
   * @param {string} ch Expected character to consume.
   */
  private consume(ch: string) {
    if (this.peek() !== ch) {
      throw this.error(`expected "${ch}"`);
    }
    this.pos++;
  }

  /**
   * Build a standardized bad request exception.
   * @param {string} details Human-readable parser error details.
   * @return {BadRequestException} Structured bad request exception.
   */
  private error(details: string) {
    return new BadRequestException({
      message: 'Invalid fields query parameter',
      details,
      position: this.pos,
    });
  }
}

export const __FieldsParserTest = {
  Parser,
};

/**
 * Public parser entry-point for `fields`.
 */
export class FieldsParser {
  /**
   * Parse a `fields` value into a projection tree.
   * Returns `undefined` if no value is provided.
   *
   * @param {unknown} value Raw `fields` query parameter value.
   * @return {FieldsProjection | undefined} Parsed projection tree or undefined.
   * @throws {BadRequestException} If value type or syntax is invalid.
   */
  static parse(value: unknown): FieldsProjection | undefined {
    if (typeof value === 'undefined' || value === null || value === '') {
      return undefined;
    }

    if (typeof value !== 'string') {
      throw new BadRequestException({
        message: 'Invalid fields query parameter',
        details: 'fields must be a string',
      });
    }

    const parser = new Parser(value);
    return parser.parse();
  }
}
