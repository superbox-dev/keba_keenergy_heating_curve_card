import { afterEach } from 'vitest';

// Bundler-defined globals the sources read, set by esbuild in the build.
Object.assign(globalThis, { __VERSION__: '0.0.0-test' });

afterEach(() => {
  document.body.replaceChildren();
});
