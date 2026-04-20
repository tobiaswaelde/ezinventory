import tsParser from '@typescript-eslint/parser';

export default [
  {
    ignores: ['.nuxt/**', '.output/**', 'node_modules/**']
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: 'module'
    },
    rules: {
      'no-console': 'off'
    }
  }
];
