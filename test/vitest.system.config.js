import { defineConfig } from 'vitest/config';

// Tests of the built card in Home Assistant in Docker, run `npm run build` and `npx playwright install chromium` first.
export default defineConfig({
  test: {
    include: ['test/system/**/*.test.js'],
    environment: 'node',
    globalSetup: ['./test/system-setup.mjs'],
    testTimeout: 60_000,
    hookTimeout: 60_000,
    fileParallelism: false,
  },
});
