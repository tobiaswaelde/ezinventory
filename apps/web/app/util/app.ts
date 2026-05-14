/**
 * Builds a title string by joining the provided parts with a separator.
 * @param {string[]} parts The parts of the title to be joined.
 * @returns {string} The constructed title string.
 */
export function buildTitle(...parts: string[]) {
  return parts.join(' • ');
}
