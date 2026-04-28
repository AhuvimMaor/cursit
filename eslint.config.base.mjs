import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export const commonRules = {
  'import/order': 'off',
  'sort-imports': 'off',
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/no-unused-vars': [
    'error',
    {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_',
    },
  ],
  '@typescript-eslint/array-type': [
    'error',
    {
      default: 'array',
      readonly: 'array',
    },
  ],
  'no-restricted-imports': [
    'error',
    {
      patterns: ['../../*'],
    },
  ],
  'import/consistent-type-specifier-style': 'off',
  '@typescript-eslint/naming-convention': [
    'error',
    {
      selector: 'typeLike',
      format: ['PascalCase'],
    },
    {
      selector: 'variable',
      format: ['camelCase'],
      leadingUnderscore: 'allow',
    },
    {
      selector: 'variable',
      modifiers: ['const', 'exported'],
      format: ['UPPER_CASE', 'camelCase', 'PascalCase'],
      leadingUnderscore: 'allow',
    },
    {
      selector: 'variable',
      modifiers: ['const'],
      format: ['UPPER_CASE', 'camelCase'],
      leadingUnderscore: 'allow',
    },
    {
      selector: 'parameter',
      format: ['camelCase'],
      leadingUnderscore: 'allow',
    },
    {
      selector: 'function',
      format: ['camelCase', 'PascalCase'],
    },
    {
      selector: 'enum',
      format: ['camelCase', 'PascalCase'],
    },
  ],
  '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
  'prefer-arrow-callback': 'error',
};

export default tseslint.config({
  extends: [eslint.configs.recommended, tseslint.configs.recommended],
  files: ['src/**/*.{ts,tsx}'],
  languageOptions: {
    ecmaVersion: 'latest',
    globals: globals.node,
  },
  rules: commonRules,
});
