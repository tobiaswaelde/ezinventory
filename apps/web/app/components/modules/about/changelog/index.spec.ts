import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { mount } from '@vue/test-utils';
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

async function loadVueComponent(filePath: string) {
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
        setup(build: { onResolve: Function }) {
          build.onResolve({ filter: /^~\// }, (args: { path: string }) => ({
            path: join(appRoot, args.path.slice(2)),
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

describe('About changelog', () => {
  it('renders the full release list and marks the installed release with a warning badge', async () => {
    const component = await loadVueComponent(
      resolve(process.cwd(), 'app/components/modules/about/changelog/index.vue'),
    );

    const wrapper = mount(component, {
      props: {
        installedVersion: '1.2.0',
        latestVersion: '1.3.0',
        versions: [
          {
            version: '1.3.0',
            name: 'Version 1.3.0',
            publishedAt: '2026-06-24T12:00:00.000Z',
            body: 'Latest release',
            url: 'https://example.com/1.3.0',
            isLatest: true,
            isInstalled: false,
          },
          {
            version: '1.2.0',
            name: 'Version 1.2.0',
            publishedAt: '2026-05-12T12:00:00.000Z',
            body: 'Installed release',
            url: 'https://example.com/1.2.0',
            isLatest: false,
            isInstalled: true,
          },
        ],
      },
      global: {
        components: {
          UPageCard: {
            template: `
              <section>
                <slot name="header" />
                <slot />
              </section>
            `,
          },
          UBadge: {
            props: ['label', 'color'],
            template: '<span class="badge">{{ color }}:{{ label }}</span>',
          },
          UChangelogVersion: {
            props: ['title', 'description', 'date', 'badge', 'to'],
            template: `
              <article>
                <span class="version-badge">{{ badge }}</span>
                <h2>{{ title }}</h2>
                <slot name="body" />
              </article>
            `,
          },
          UChangelogVersions: {
            props: ['versions'],
            template: `
              <section>
                <div v-for="version in versions" :key="version.version" class="version">
                  <slot :version="version">{{ version.title }}</slot>
                </div>
              </section>
            `,
          },
        },
      },
    });

    expect(wrapper.text()).toContain('Version 1.3.0');
    expect(wrapper.text()).toContain('Version 1.2.0');
    expect(wrapper.text()).toContain('warning:Installed');
  });
});
