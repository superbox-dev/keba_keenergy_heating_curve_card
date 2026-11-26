// @ts-check
import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/unit/**/*.test.js'],
    exclude: [...configDefaults.exclude],
    // Browser-like environment, like the Home Assistant frontend.
    environment: 'jsdom',
    env: { TZ: 'Etc/UTC' },
    setupFiles: ['./test/unit/setup.js'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.js'],
      // lcov for the upload to Codecov in the CI.
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: 'test/coverage',
      thresholds: { lines: 100, branches: 100, functions: 100, statements: 100 },
    },
  },
});
