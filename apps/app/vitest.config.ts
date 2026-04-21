import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/unit/**/*.test.ts'],
    environment: 'node',
    setupFiles: ['test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: [
        'app/composables/use-i18n.ts',
        'app/composables/use-theme.ts',
        'app/utils/auth-validation.ts',
        'app/utils/settings-validation.ts',
        'app/utils/labels-validation.ts',
        'app/utils/scan-validation.ts'
      ],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100
      }
    }
  }
});
