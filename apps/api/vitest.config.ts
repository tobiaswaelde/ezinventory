import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  test: {
    include: ['test/**/*.test.ts'],
    setupFiles: ['test/setup.ts'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: [
        'src/modules/health/health.controller.ts',
        'src/modules/categories/categories.controller.ts',
        'src/modules/containers/containers.controller.ts',
        'src/modules/items/items.controller.ts',
        'src/modules/locations/locations.controller.ts',
        'src/modules/auth/auth.controller.ts',
        'src/modules/setup/setup.controller.ts'
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
