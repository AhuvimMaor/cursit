import { commonRules } from '../eslint.config.base.mjs';
import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    extends: [eslint.configs.recommended, tseslint.configs.recommended],
    files: ['src/**/*.ts'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.node,
    },
    rules: commonRules,
  },
  {
    ignores: ['dist', 'node_modules'],
  },
);
