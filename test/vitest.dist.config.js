// @ts-check
import { defineConfig } from 'vitest/config';

// Smoke tests of the built bundle in dist/, run `npm run build` first.
export default defineConfig({
  test: {
    include: ['test/dist/**/*.test.js'],
    environment: 'jsdom',
    env: { TZ: 'Etc/UTC' },
    setupFiles: ['./test/dist/setup.js'],
  },
});
