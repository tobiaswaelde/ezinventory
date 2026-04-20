export default defineNuxtConfig({
  srcDir: 'app/',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@vite-pwa/nuxt'],
  typescript: {
    tsConfig: {
      extends: '../../../tsconfig.json'
    }
  },
  colorMode: {
    preference: 'light',
    fallback: 'light',
    classSuffix: '',
    storageKey: 'ezinventory.theme',
    dataValue: 'theme'
  },
  css: ['~/assets/main.css'],
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001/api/v1'
    }
  },
  app: {
    head: {
      title: 'EZ Inventory'
    }
  },
  pwa: {
    registerType: 'autoUpdate',
    includeAssets: ['pwa-192x192.svg', 'pwa-512x512.svg'],
    manifest: {
      id: '/',
      name: 'EZ Inventory',
      short_name: 'EZInventory',
      description: 'Mobile-first inventory management with QR/barcode workflows.',
      theme_color: '#1f6feb',
      background_color: '#f3f5f7',
      display: 'standalone',
      orientation: 'portrait',
      scope: '/',
      start_url: '/',
      icons: [
        {
          src: '/pwa-192x192.svg',
          sizes: '192x192',
          type: 'image/svg+xml',
          purpose: 'any'
        },
        {
          src: '/pwa-512x512.svg',
          sizes: '512x512',
          type: 'image/svg+xml',
          purpose: 'any'
        }
      ]
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico,json,webp,woff2}']
    },
    devOptions: {
      enabled: true,
      suppressWarnings: true,
      navigateFallback: '/'
    }
  }
});
