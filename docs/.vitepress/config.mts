import { defineConfig } from 'vitepress';

const GITHUB_REPO = 'https://github.com/tobiaswaelde/ezinventory';

export default defineConfig({
  title: 'EZ Inventory',
  description: 'Documentation for EZ Inventory',
  base: process.env.GITHUB_ACTIONS ? '/ezinventory/' : '/',
  cleanUrls: true,
  lastUpdated: true,
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/' },
      { text: 'Architecture', link: '/architecture' },
      { text: 'Testing (App)', link: '/testing-app' },
      { text: 'Operations', link: '/operations' },
      { text: 'Release', link: '/release-strategy' },
      { text: 'GitHub', link: GITHUB_REPO }
    ],
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Overview', link: '/' },
          { text: 'Architecture', link: '/architecture' },
          { text: 'Testing (App)', link: '/testing-app' },
          { text: 'Operations', link: '/operations' },
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
      message: 'Open-source documentation for EZ Inventory.'
    }
  }
});
