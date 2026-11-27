import { afterEach, vi } from 'vitest';
import { defineHaForm } from '../fixtures/ha-form';

/**
 * @typedef {object} Pbkdf2Options
 * @property {number} c
 * @property {number} dkLen
 */

// Bundler-defined globals the sources read, set by esbuild in the build.
Object.assign(globalThis, { __VERSION__: '0.0.0-test' });

// The forms of Home Assistant, the editor of the card uses them.
defineHaForm();

// The same PBKDF2-SHA256 with Web Crypto, the JavaScript version is very slow while the coverage is measured.
vi.mock('@noble/hashes/pbkdf2.js', async (importOriginal) => {
  const { pbkdf2 } = await import('../fixtures/password');
  return {
    .../** @type {object} */ (await importOriginal()),
    pbkdf2Async: vi.fn(
      /**
       * @param {unknown} _hash
       * @param {Uint8Array<ArrayBuffer>} password
       * @param {Uint8Array<ArrayBuffer>} salt
       * @param {Pbkdf2Options} options
       * @returns {Promise<Uint8Array>}
       */
      (_hash, password, salt, options) => pbkdf2(password, salt, options.c, options.dkLen),
    ),
  };
});

afterEach(() => {
  document.body.replaceChildren();
  vi.useRealTimers();
  vi.restoreAllMocks();
});
