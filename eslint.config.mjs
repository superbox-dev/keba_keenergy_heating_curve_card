import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: ['dist/', 'node_modules/', 'test/coverage/'],
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
    files: ['*.mjs', 'scripts/**/*.mjs', 'test/*.mjs'],
    languageOptions: {
      globals: globals.node,
    },
  },
  // The tests are TypeScript, like in the Home Assistant frontend.
  ...tseslint.configs.recommended.map(config => ({ ...config, files: ['test/**/*.ts', 'src/**/*.d.ts'] })),
  {
    files: ['test/**/*.ts'],
    languageOptions: {
      globals: globals.browser,
    },
  },
];
