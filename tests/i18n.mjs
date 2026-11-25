import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DE, languageCode, translate, formatNumber } from '../src/i18n.js';
assert.equal(languageCode({}, { language: 'de-CH' }), 'de');
assert.equal(languageCode({}, { language: 'en-GB' }), 'en');
assert.equal(languageCode({}, { language: 'fr' }), 'en');
assert.equal(languageCode({ language: 'de' }, { language: 'en' }), 'de');
assert.equal(languageCode({}, { language: 'de', locale: { language: 'en' } }), 'en');
assert.equal(translate('de', 'Add point'), 'Punkt hinzufügen');
assert.equal(translate('en', 'Add point'), 'Add point');
assert.equal(translate('de', 'Loading curve {name} …', { name: 'HC1' }), 'Kurve HC1 wird geladen …');
assert.equal(formatNumber(36.5, {}, { language: 'de' }), '36,5');
assert.equal(formatNumber(36.5, {}, { language: 'en' }), '36.5');
assert.equal(formatNumber(1234.5, {}, { language: 'de', locale: { number_format: 'comma_decimal' } }), '1,234.5');
assert.equal(formatNumber(1234.5, {}, { language: 'en', locale: { number_format: 'decimal_comma' } }), '1.234,5');
assert.equal(formatNumber(1234.5, {}, { language: 'de', locale: { number_format: 'none' } }), '1234.5');
for (const [key, value] of Object.entries(DE)) {
  assert(value.trim(), key);
  assert.deepEqual([...key.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort(), [...value.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort(), key);
}
for (const name of ['card.js', 'editor.js']) {
  const source = fs.readFileSync(new URL('../src/' + name, import.meta.url), 'utf8');
  for (const match of source.matchAll(/_t\((['"])([^'"\n]*)\1/g))assert(Object.hasOwn(DE, match[2]), 'Missing translation ' + match[2]);
}
console.log('PASS: language/region selection, fallback, manual overrides, catalog coverage, placeholders and HA number formats.');
