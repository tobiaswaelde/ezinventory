import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

const appDir = fileURLToPath(new URL('./app', import.meta.url));
const sharedDir = fileURLToPath(new URL('../../libs/shared/src', import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '~': appDir,
      '@': appDir,
      '@ezinventory/shared': sharedDir,
    },
  },
  test: {
    environment: 'node',
    globals: true,
    // Keep plain Vitest projects until Nuxt runtimeConfig is structuredClone-safe for @nuxt/test-utils in this app.
    projects: [
      {
        test: {
          name: 'server',
          environment: 'node',
          globals: true,
          include: ['server/**/*.{test,spec}.ts'],
          setupFiles: ['./test/setup.ts'],
        },
      },
      {
        test: {
          name: 'dom',
          environment: 'happy-dom',
          globals: true,
          include: [
            'app/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
            'test/nuxt/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
          ],
          setupFiles: ['./test/setup.ts'],
        },
      },
    ],
  },
});
