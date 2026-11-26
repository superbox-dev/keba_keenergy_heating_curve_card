import { afterEach, vi } from 'vitest';

interface Pbkdf2Options {
  c: number;
  dkLen: number;
}

// Bundler-defined globals the sources read, set by esbuild in the build.
Object.assign(globalThis, { __VERSION__: '0.0.0-test' });

// The same PBKDF2-SHA256 with Web Crypto, the JavaScript version is very slow while the coverage is measured.
vi.mock('@noble/hashes/pbkdf2.js', async (importOriginal) => {
  const { pbkdf2 } = await import('../fixtures/password');
  return {
    ...await importOriginal<object>(),
    pbkdf2Async: vi.fn(
      (_hash: unknown, password: Uint8Array<ArrayBuffer>, salt: Uint8Array<ArrayBuffer>, options: Pbkdf2Options) =>
        pbkdf2(password, salt, options.c, options.dkLen),
    ),
  };
});

afterEach(() => {
  document.body.replaceChildren();
  vi.useRealTimers();
  vi.restoreAllMocks();
});
