import { describe, expect, it } from 'vitest';
import { disabledIf, esc, html } from '../../src/html';

describe('esc', () => {
  it('escapes the special characters of HTML', () => {
    expect(esc(`<b title="x">Tom & Jerry's</b>`)).toBe('&lt;b title=&quot;x&quot;&gt;Tom &amp; Jerry&#39;s&lt;/b&gt;');
  });

  it.each([
    [null, ''],
    [undefined, ''],
    [0, '0'],
    [21.5, '21.5'],
  ])('shows %o as %o', (value, expected) => {
    expect(esc(value)).toBe(expected);
  });
});

describe('html', () => {
  it('removes the line breaks with their indentation', () => {
    const name = 'HC1';

    const result = html`<p>
      <b>${name}</b> table
    </p>`;

    expect(result).toBe('<p><b>HC1</b> table</p>');
  });

  it('inserts the values unchanged', () => {
    expect(html`<i>${'<b>'}</i>${2}`).toBe('<i><b></i>2');
  });
});

describe('disabledIf', () => {
  it.each([
    [true, 'disabled'],
    [false, ''],
  ])('returns the attribute for %s', (disabled, expected) => {
    expect(disabledIf(disabled)).toBe(expected);
  });
});
