import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

// Tests of the card in a real Chromium, run `npx playwright install chromium` once.
export default defineConfig({
  test: {
    include: ['test/e2e/**/*.test.ts'],
    setupFiles: ['./test/e2e/setup.ts'],
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      instances: [{ browser: 'chromium' }],
    },
  },
});
