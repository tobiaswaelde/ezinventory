import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { describe, expect, it } from 'vitest';

const specRequire = createRequire(import.meta.url);
const repoRoot = resolve(process.cwd(), '../..');
const appRoot = resolve(process.cwd(), 'app');

function findPackageDir(name: string) {
  try {
    const packageJsonPath = specRequire.resolve(`${name}/package.json`);
    return dirname(packageJsonPath);
  }
  catch {}

  const pnpmRoot = join(repoRoot, 'node_modules', '.pnpm');

  for (const entry of readdirSync(pnpmRoot)) {
    const candidate = join(pnpmRoot, entry, 'node_modules', ...name.split('/'));

    if (statSync(candidate, { throwIfNoEntry: false })?.isDirectory()) {
      return candidate;
    }
  }

  throw new Error(`Unable to resolve package directory for ${name}`);
}

async function loadVueComponent(filePath: string, overrides: Record<string, string>) {
  const compilerDir = findPackageDir('@vue/compiler-sfc');
  const esbuildDir = findPackageDir('esbuild');
  const compiler = await import(join(compilerDir, 'dist', 'compiler-sfc.cjs.js'));
  const esbuild = await import(join(esbuildDir, 'lib', 'main.js'));

  const source = readFileSync(filePath, 'utf8');
  const { descriptor } = compiler.parse(source, { filename: filePath });
  const script = compiler.compileScript(descriptor, {
    id: filePath,
    inlineTemplate: true,
  });

  const result = await esbuild.build({
    absWorkingDir: appRoot,
    bundle: true,
    external: ['markdown-it', 'vue'],
    format: 'cjs',
    platform: 'node',
    stdin: {
      contents: script.content,
      loader: 'ts',
      resolveDir: dirname(filePath),
      sourcefile: filePath,
    },
    write: false,
    plugins: [
      {
        name: 'app-alias',
        setup(build: {
          onLoad: Function;
          onResolve: Function;
        }) {
          build.onResolve({ filter: /^~\// }, (args: { path: string }) => {
            if (overrides[args.path]) {
              return { path: args.path, namespace: 'override' };
            }

            return {
              path: join(appRoot, args.path.slice(2)),
            };
          });

          build.onLoad({ filter: /.*/, namespace: 'override' }, (args: { path: string }) => ({
            contents: overrides[args.path],
            loader: 'ts',
          }));
        },
      },
    ],
  });

  const module = { exports: {} as Record<string, unknown> };
  const localRequire = createRequire(filePath);
  const evaluator = new Function('require', 'module', 'exports', result.outputFiles[0].text);
  evaluator(localRequire, module, module.exports);

  return (module.exports.default ?? module.exports) as object;
}

describe('Sidebar footer', () => {
  it('loads shared release metadata client-side on mount, uses the installed release version for the badge, and shows a red update indicator', async () => {
    const component = await loadVueComponent(
      resolve(process.cwd(), 'app/components/layout/sidebar/footer.vue'),
      {
        '~/composables/app/releases': `
          export const useAppReleases = (options) => {
            globalThis.__appReleasesCalls = (globalThis.__appReleasesCalls ?? 0) + 1;
            globalThis.__appReleasesOptions = options;
            return {
              execute: () => {
                globalThis.__appReleasesExecuteCalls = (globalThis.__appReleasesExecuteCalls ?? 0) + 1;
              },
            };
          };
        `,
        '~/store/app': `
          export const useAppStore = () => ({
            version: '1.0.0',
            latestVersion: '1.3.0',
            installedVersion: '1.2.0',
            releaseMetadata: null,
            hasUpdate: true,
          });
        `,
        '~/types/routes': `
          export const Routes = { About: 'about' };
        `,
      },
    );

    const originalUseI18n = (globalThis as typeof globalThis & { useI18n?: unknown }).useI18n;

    (globalThis as typeof globalThis & { useI18n: () => { t: (key: string) => string } }).useI18n = () => ({
      t: (key: string) =>
        ({
          'core.sidebar.footer.about.label': 'About',
          'core.sidebar.footer.github.label': 'GitHub',
          'core.sidebar.footer.report-bug.label': 'Report Bug',
        })[key] ?? key,
    });

    try {
      globalThis.__appReleasesCalls = 0;
      globalThis.__appReleasesExecuteCalls = 0;
      globalThis.__appReleasesOptions = undefined;

      const wrapper = mount(component, {
        props: {
          collapsed: false,
        },
        global: {
          components: {
            UNavigationMenu: {
              props: ['items'],
              template: `
                <ul>
                  <li v-for="item in items" :key="item.label">
                    <span>{{ item.label }}</span>
                    <span v-if="item.badge">{{ item.badge.label }}</span>
                    <span v-if="item.chip">chip:{{ item.chip.color }}</span>
                  </li>
                </ul>
              `,
            },
          },
        },
      });

      await nextTick();

      expect(globalThis.__appReleasesCalls).toBe(1);
      expect(globalThis.__appReleasesOptions).toEqual({
        immediate: false,
        server: false,
      });
      expect(globalThis.__appReleasesExecuteCalls).toBe(1);
      expect(wrapper.text()).toContain('About');
      expect(wrapper.text()).toContain('1.2.0');
      expect(wrapper.text()).toContain('chip:error');
    }
    finally {
      delete globalThis.__appReleasesCalls;
      delete globalThis.__appReleasesExecuteCalls;
      delete globalThis.__appReleasesOptions;

      if (originalUseI18n === undefined) {
        delete (globalThis as typeof globalThis & { useI18n?: unknown }).useI18n;
      }
      else {
        (globalThis as typeof globalThis & { useI18n: unknown }).useI18n = originalUseI18n;
      }
    }
  });

  it('falls back to the local web version badge when installed release metadata is unavailable', async () => {
    const component = await loadVueComponent(
      resolve(process.cwd(), 'app/components/layout/sidebar/footer.vue'),
      {
        '~/composables/app/releases': `
          export const useAppReleases = () => ({
            execute: () => {},
          });
        `,
        '~/store/app': `
          export const useAppStore = () => ({
            version: '1.0.0',
            latestVersion: null,
            installedVersion: null,
            releaseMetadata: { installedVersion: null },
            hasUpdate: false,
          });
        `,
        '~/types/routes': `
          export const Routes = { About: 'about' };
        `,
      },
    );

    const originalUseI18n = (globalThis as typeof globalThis & { useI18n?: unknown }).useI18n;

    (globalThis as typeof globalThis & { useI18n: () => { t: (key: string) => string } }).useI18n = () => ({
      t: (key: string) =>
        ({
          'core.sidebar.footer.about.label': 'About',
          'core.sidebar.footer.github.label': 'GitHub',
          'core.sidebar.footer.report-bug.label': 'Report Bug',
        })[key] ?? key,
    });

    try {
      const wrapper = mount(component, {
        props: {
          collapsed: false,
        },
        global: {
          components: {
            UNavigationMenu: {
              props: ['items'],
              template: `
                <ul>
                  <li v-for="item in items" :key="item.label">
                    <span>{{ item.label }}</span>
                    <span v-if="item.badge">{{ item.badge.label }}</span>
                  </li>
                </ul>
              `,
            },
          },
        },
      });

      expect(wrapper.text()).toContain('1.0.0');
    }
    finally {
      if (originalUseI18n === undefined) {
        delete (globalThis as typeof globalThis & { useI18n?: unknown }).useI18n;
      }
      else {
        (globalThis as typeof globalThis & { useI18n: unknown }).useI18n = originalUseI18n;
      }
    }
  });
});
