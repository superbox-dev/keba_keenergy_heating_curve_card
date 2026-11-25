import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import globals from 'globals';

export default [
  {
    ignores: ['dist/', 'node_modules/', 'keba_keenergy_heating_curve_card.js'],
  },
  js.configs.recommended,
  stylistic.configs.customize({
    indent: 2,
    quotes: 'single',
    semi: true,
    braceStyle: '1tbs',
  }),
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    rules: {
      '@stylistic/max-len': ['error', {
        code: 120,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreRegExpLiterals: true,
        ignoreUrls: true,
      }],
    },
  },
  {
    files: ['src/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
        __VERSION__: 'readonly',
      },
    },
  },
  {
    files: ['*.mjs', 'scripts/**/*.mjs', 'tests/**/*.mjs'],
    languageOptions: {
      globals: globals.node,
    },
  },
];
