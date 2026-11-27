import { afterEach } from 'vitest';
import { defineHaForm } from '../fixtures/ha-form';

// Bundler-defined globals the sources read, set by esbuild in the build.
Object.assign(globalThis, { __VERSION__: '0.0.0-test' });

// The forms of Home Assistant, the editor of the card uses them.
defineHaForm();

// Fake theme with the global variables of the Home Assistant frontend that the card uses, the light theme of
// `src/resources/theme/` (typography, core and color globals). The card has no fallbacks for them.
const theme = document.createElement('style');
theme.textContent = `
  :root {
    --ha-font-family-body: Roboto, Noto, sans-serif;
    --ha-font-size-scale: 1;
    --ha-font-size-xs: calc(10px * var(--ha-font-size-scale));
    --ha-font-size-s: calc(12px * var(--ha-font-size-scale));
    --ha-font-size-m: calc(14px * var(--ha-font-size-scale));
    --ha-font-size-l: calc(16px * var(--ha-font-size-scale));
    --ha-font-size-xl: calc(20px * var(--ha-font-size-scale));
    --ha-font-size-2xl: calc(24px * var(--ha-font-size-scale));
    --ha-font-weight-normal: 400;
    --ha-font-weight-medium: 500;
    --ha-font-weight-bold: 700;
    --ha-line-height-normal: 1.6;
    --ha-border-radius-md: 8px;
    --ha-border-radius-lg: 12px;
    --primary-text-color: #212121;
    --secondary-text-color: #727272;
    --card-background-color: #ffffff;
    --secondary-background-color: #e5e5e5;
    --divider-color: rgba(0, 0, 0, 0.12);
    --error-color: #db4437;
  }
`;
document.head.append(theme);

afterEach(() => {
  document.body.replaceChildren();
});
