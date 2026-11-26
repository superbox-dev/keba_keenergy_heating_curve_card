// Helpers for the HTML templates of the card and the editor.

/** @type {Record<string, string>} */
const ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' };

/**
 * Escapes a value for HTML text and attribute values.
 *
 * @param {unknown} value Value to show, `null` and `undefined` become an empty string.
 * @returns {string} The escaped text.
 */
export function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ENTITIES[character]);
}

/**
 * Template tag that removes the line breaks with their indentation from the static parts of a template.
 *
 * Templates can span several lines without adding whitespace between the elements. Break lines only between
 * elements or `${}` expressions, never inside a tag or a text. The values are inserted unchanged, escape them with
 * `esc()`.
 *
 * @param {TemplateStringsArray} strings Static parts of the template.
 * @param {...unknown} values Values of the `${}` expressions, already escaped.
 * @returns {string} The HTML.
 */
export function html(strings, ...values) {
  return strings.reduce((result, part, index) =>
    result + part.replace(/\n\s*/g, '') + (index < values.length ? String(values[index]) : ''), '');
}

/**
 * Attribute `disabled` for a template.
 *
 * @param {boolean} disabled Whether the element is disabled.
 * @returns {string} `disabled` or an empty string.
 */
export function disabledIf(disabled) {
  return disabled ? 'disabled' : '';
}
