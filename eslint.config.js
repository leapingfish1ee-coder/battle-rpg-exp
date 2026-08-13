import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const forbiddenArchitectureImports = [
  {
    name: 'pixi.js',
    message: 'Domain and simulation layers must not depend on PixiJS.',
  },
];

export default tseslint.config(
  {
    ignores: ['dist/**', 'coverage/**', 'playwright-report/**', 'test-results/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts', 'tests/**/*.ts'],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: ['src/domain/**/*.ts', 'src/simulation/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: forbiddenArchitectureImports,
          patterns: [
            {
              group: ['**/rendering/**', '**/network/**', '**/platform/**'],
              message: 'Domain and simulation layers may only depend on pure contracts and data.',
            },
          ],
        },
      ],
      'no-restricted-globals': [
        'error',
        'window',
        'document',
        'WebSocket',
        'localStorage',
        'sessionStorage',
      ],
    },
  },
);
