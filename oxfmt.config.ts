import { defineConfig } from 'oxfmt'

export default defineConfig({
  ignorePatterns: ['.expo/**', 'dist/**', 'node_modules/**'],
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  singleQuote: true,
  trailingComma: 'all',
  arrowParens: 'avoid',
  bracketSpacing: true,
  semi: false,
  sortTailwindcss: {},
})
