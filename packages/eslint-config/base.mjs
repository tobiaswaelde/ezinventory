import tsParser from '@typescript-eslint/parser';

/**
 * Shared flat ESLint config for TypeScript projects in this monorepo.
 * @param {{ ignores?: string[] }} [options]
 * @returns {import('eslint').Linter.Config[]}
 */
export function createTypeScriptConfig(options = {}) {
  const { ignores = [] } = options;

  return [
    {
      ignores: ['node_modules/**', ...ignores]
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
}

export default createTypeScriptConfig;
