// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  srcDir: 'app',
  serverDir: 'server',
  devtools: { enabled: true },
  sourcemap: false,
  runtimeConfig: {
    public: {
      APP_BASE_URL: '',
      API_BASE_URL: '',
    },
  },

  app: {
    head: {
      link: [{ rel: 'icon', type: 'image/png', href: '/logo_48.png' }],
      htmlAttrs: {
        class: 'h-full',
      },
      bodyAttrs: {
        class: 'h-full select-none',
      },
      viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
      charset: 'utf-8',
      title: 'EZInventory',
      titleTemplate: '%s • EZInventory',
      meta: [
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: 'EZInventory' },
        { property: 'og:description', content: 'Inventory Management System' },
      ],
    },
  },
  css: ['~/assets/css/main.css'],
  ssr: false,

  //#region plugins
  modules: [
    '@nuxt/fonts',
    '@nuxtjs/tailwindcss',
    '@nuxt/ui',
    '@nuxt/content',
    '@nuxt/image',
    '@vite-pwa/nuxt',
    '@nuxtjs/i18n',
    '@nuxtjs/device',
    '@pinia/nuxt',
  ],

  //#region fonts
  fonts: {},
  //#endregion
  //#region tailwindcss
  tailwindcss: {
    theme: {
      container: {},
    },
    corePlugins: {
      container: false, // optional if you're not using .container class
    },
    future: {
      // Ensure container queries are enabled in newer versions
      hoverOnlyWhenSupported: true,
    },
  },
  //#endregion
  //#region i18n
  i18n: {
    defaultLocale: 'en-US',
    strategy: 'no_prefix',
    autoDeclare: true,
    locales: [
      { code: 'en-US', name: 'English', dir: 'ltr', iso: 'en-US', file: 'en-US.json' },
      { code: 'de-DE', name: 'Deutsch', dir: 'ltr', iso: 'de-DE', file: 'de-DE.json' },
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'locale',
      // redirectOn: 'all',
      // alwaysRedirect: true,
    },
    bundle: {
      fullInstall: true,
    },
  },
  //#endregion
  //#region nuxt ui
  ui: {
    colorMode: true,
    fonts: true,
    prefix: 'U',
    theme: {
      colors: [
        'primary',
        'secondary',
        'success',
        'warning',
        'error',
        'info',
        'neutral',
        //
        'amber',
        'blue',
        'cyan',
        'emerald',
        'fuchsia',
        'gray',
        'green',
        'indigo',
        'lime',
        'orange',
        'pink',
        'purple',
        'red',
        'rose',
        'sky',
        'slate',
        'teal',
        'violet',
        'yellow',
        'zinc',
      ],
    },
  },
  //#endregion
  //#region color mode
  colorMode: {
    fallback: 'dark',
    preference: 'dark',
  },
  //#endregion
  //#region pwa
  pwa: {
    includeAssets: ['favicon.ico', 'logo_512.png', 'logo_192.png'],
    manifest: {
      name: 'EZInventory',
      short_name: 'EZInventory',
      description: 'Inventory Management System',
      theme_color: '#18181b',
      display: 'standalone',
      icons: [
        { src: 'logo_512.png', sizes: '512x512', type: 'image/png' },
        { src: 'logo_192.png', sizes: '192x192', type: 'image/png' },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
    },
  },
  //#endregion
  //#endregion

  devServer: {
    port: 3000,
  },
  vite: {
    define: {
      __ICONIFY_DISABLE_CACHE__: true,
      __ICONIFY_NO_REMOTE__: true,
    },
    server: {
      watch: {
        ignored: ['**/node_modules/**', '**/static/**', '**/public/**', '**/.output/**', '**/.nuxt/**'],
      },
    },
    optimizeDeps: {
      exclude: ['@nuxt/ui', '@nuxt/content', '@nuxt/image', '@nuxtjs/i18n'],
      include: [
        '@nuxt/ui > prosemirror-state',
        '@nuxt/ui > prosemirror-transform',
        '@nuxt/ui > prosemirror-model',
        '@nuxt/ui > prosemirror-view',
        '@nuxt/ui > prosemirror-gapcursor',
      ],
    },
  },

  typescript: {
    tsConfig: {
      compilerOptions: {
        // verbatimModuleSyntax: false,
        noUncheckedIndexedAccess: false,
      },
    },
  },
});
