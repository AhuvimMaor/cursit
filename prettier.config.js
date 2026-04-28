//  @ts-check

/** @type {import('prettier').Config} */
const config = {
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  jsxSingleQuote: true,
  arrowParens: 'always',
  printWidth: 100,
  tabWidth: 2,
  importOrder: ['<THIRD_PARTY_MODULES>', '^@/(.*)$', '^[./]'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: false,
  plugins: ['@trivago/prettier-plugin-sort-imports'],
};

export default config;
