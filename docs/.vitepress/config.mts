import { defineConfig } from 'vitepress';

const GITHUB_REPO = 'https://github.com/tobiaswaelde/ezinventory';

export default defineConfig({
  title: 'EZ Inventory Docs',
  description: 'Admin-focused documentation for EZ Inventory',
  base: process.env.GITHUB_ACTIONS ? '/ezinventory/' : '/',
  cleanUrls: true,
  lastUpdated: true,
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Admin Quickstart', link: '/admin-quickstart' },
      { text: 'Feature Tour', link: '/admin-feature-tour' },
      { text: 'Operations', link: '/operations' },
      { text: 'Release', link: '/release-strategy' },
      { text: 'GitHub', link: GITHUB_REPO }
    ],
    sidebar: [
      {
        text: 'Admin Guide',
        items: [
          { text: 'Docs Home', link: '/' },
          { text: 'Admin Quickstart', link: '/admin-quickstart' },
          { text: 'Feature Tour', link: '/admin-feature-tour' },
          { text: 'Operations', link: '/operations' }
        ]
      },
      {
        text: 'Reference',
        items: [
          { text: 'Architecture', link: '/architecture' },
          { text: 'Testing (App)', link: '/testing-app' },
          { text: 'Release Strategy', link: '/release-strategy' }
        ]
      }
    ],
    editLink: {
      pattern: `${GITHUB_REPO}/edit/main/docs/:path`,
      text: 'Edit this page on GitHub'
    },
    socialLinks: [{ icon: 'github', link: GITHUB_REPO }],
    footer: {
      message: 'Open-source docs for EZ Inventory admins.'
    }
  }
});
