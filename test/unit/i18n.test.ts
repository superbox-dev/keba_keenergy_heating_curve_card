import { describe, expect, it, vi } from 'vitest';
import { DE, errorText, formatNumber, languageCode, translate } from '../../src/i18n';

/** The sources of `src/` by path, to find the texts of the `_t()` and `t()` calls. */
const SOURCES = import.meta.glob<string>('../../src/**/*.js', { query: '?raw', import: 'default', eager: true });

const placeholders = (text: string): string[] => [...text.matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort();

/** The texts of the `_t()` and `t()` calls in a source file. */
const sourceTexts = (source: string): string[] =>
  [...source.matchAll(/(?<![\w$])_?t\((['"])([^'"\n]*)\1/g)].map(match => match[2]);

const browserLanguage = (language: string) => vi.spyOn(navigator, 'language', 'get').mockReturnValue(language);

describe('languageCode', () => {
  it.each([
    [{}, { language: 'de-CH' }, 'de'],
    [{}, { language: 'de_AT' }, 'de'],
    [{}, { language: 'en-GB' }, 'en'],
    [{}, { language: 'fr' }, 'en'],
    [{}, undefined, 'en'],
    [undefined, undefined, 'en'],
    [{ language: 'auto' }, { language: 'de' }, 'de'],
    [{ language: 'de' }, { language: 'en' }, 'de'],
    [{ language: 'en' }, { language: 'de' }, 'en'],
    [{}, { language: 'de', locale: { language: 'en' } }, 'en'],
  ])('config %o and hass %o give %s', (config, hass, language) => {
    expect(languageCode(config, hass)).toBe(language);
  });
});

describe('translate', () => {
  it('translates to German', () => {
    expect(translate('de', 'Add point')).toBe('Punkt hinzufügen');
  });

  it('keeps the English source text', () => {
    expect(translate('en', 'Add point')).toBe('Add point');
  });

  it('keeps unknown texts', () => {
    expect(translate('de', 'Unknown text')).toBe('Unknown text');
  });

  it('replaces the placeholders', () => {
    expect(translate('de', 'Loading curve {name} …', { name: 'HC1' })).toBe('Kurve HC1 wird geladen …');
    expect(translate('en', '{count} settings sent. The next update will show the controller values.', { count: 0 }))
      .toBe('0 settings sent. The next update will show the controller values.');
  });

  it('keeps placeholders without value', () => {
    expect(translate('en', 'Loading curve {name} …')).toBe('Loading curve {name} …');
  });
});

describe('formatNumber', () => {
  it.each([
    [36.5, {}, { language: 'de' }, '36,5'],
    [36.5, {}, { language: 'en' }, '36.5'],
    [36.5, { language: 'de' }, { language: 'en' }, '36,5'],
    [36.54, {}, { language: 'en' }, '36.5'],
    [1234.5, {}, { language: 'de', locale: { number_format: 'comma_decimal' } }, '1,234.5'],
    [1234.5, {}, { language: 'en', locale: { number_format: 'decimal_comma' } }, '1.234,5'],
    // Narrow no-break space and apostrophe depend on the ICU version.
    [1234.5, {}, { language: 'en', locale: { number_format: 'quote_decimal' } }, /^1\D234\.5$/],
    [1234.5, {}, { language: 'de', locale: { number_format: 'space_comma' } }, /^1\s234,5$/],
    [1234.5, {}, { language: 'de', locale: { number_format: 'none' } }, '1234.5'],
    [1234.5, {}, { locale: { language: 'de', number_format: 'language' } }, '1.234,5'],
    [1234.5, {}, undefined, '1,234.5'],
  ])('formats %d with config %o and hass %o as %s', (value, config, hass, expected) => {
    expect(formatNumber(value, config, hass)).toMatch(expected);
  });

  it('uses the language of the browser for the system format', () => {
    browserLanguage('de-DE');

    expect(formatNumber(1.5, {}, { language: 'en', locale: { number_format: 'system' } })).toBe('1,5');
  });

  it('falls back to the language without browser language', () => {
    browserLanguage('');

    expect(formatNumber(1.5, {}, { language: 'de', locale: { number_format: 'system' } })).toBe('1.5');
  });

  it('passes the options', () => {
    expect(formatNumber(2, {}, { language: 'en' }, { minimumFractionDigits: 1 })).toBe('2.0');
  });

  it('falls back to English with an invalid locale', () => {
    expect(formatNumber(1.5, { language: 'not a locale!' })).toBe('1.5');
  });
});

describe('DE', () => {
  it.each(Object.entries(DE as Record<string, string>))('translates %s with the same placeholders', (english, german) => {
    expect(german.trim()).not.toBe('');
    expect(placeholders(german)).toEqual(placeholders(english));
  });

  it('finds the texts of the sources', () => {
    expect(Object.keys(SOURCES)).toContain('../../src/card/templates.js');
    expect(Object.values(SOURCES).flatMap(sourceTexts)).toContain('Save points');
  });

  it.each(Object.entries(SOURCES))('has every text of %s', (_, source) => {
    expect(sourceTexts(source).filter(text => !Object.hasOwn(DE, text))).toEqual([]);
  });
});

describe('errorText', () => {
  it.each([
    [Error('Forbidden'), 'Forbidden'],
    [{ message: 'Timeout' }, 'Timeout'],
    ['busy', 'busy'],
    [null, 'null'],
  ])('shows %o as %s', (error, expected) => {
    expect(errorText(error)).toBe(expected);
  });
});
