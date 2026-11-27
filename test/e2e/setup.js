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
    --ha-line-height-condensed: 1.2;
    --ha-line-height-normal: 1.6;
    --ha-space-1: 4px;
    --ha-space-2: 8px;
    --ha-space-3: 12px;
    --ha-space-4: 16px;
    --ha-space-6: 24px;
    --ha-border-radius-md: 8px;
    --ha-border-radius-pill: 9999px;
    --ha-border-radius-lg: 12px;
    --primary-text-color: #212121;
    --secondary-text-color: #727272;
    --card-background-color: #ffffff;
    --secondary-background-color: #e5e5e5;
    --divider-color: rgba(0, 0, 0, 0.12);
    --error-color: #db4437;
    --ha-color-fill-primary-quiet-resting: #eff9fe;
    --ha-color-fill-primary-loud-resting: #009ac7;
    --ha-color-fill-primary-loud-hover: #006787;
    --ha-color-fill-warning-quiet-resting: #fff0e4;
    --ha-color-fill-neutral-quiet-resting: #f4f4f4;
    --ha-color-on-primary-normal: #009ac7;
    --ha-color-on-primary-loud: #ffffff;
    --ha-color-on-warning-normal: #9d3800;
    --ha-color-on-danger-normal: #b30532;
    --ha-color-border-primary-normal: #7bd4fb;
  }
`;
document.head.append(theme);

afterEach(() => {
  document.body.replaceChildren();
});
