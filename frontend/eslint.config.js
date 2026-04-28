import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import { commonRules } from '../eslint.config.base.mjs';

export default tseslint.config(
  {
    extends: [eslint.configs.recommended, tseslint.configs.recommended],
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.browser,
    },
    rules: commonRules,
  },
  {
    ignores: ['dist', 'node_modules'],
  },
);
