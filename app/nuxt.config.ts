export default defineNuxtConfig({
  srcDir: 'app/',
  devtools: { enabled: true },
  modules: ['@nuxt/ui'],
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
  }
});
