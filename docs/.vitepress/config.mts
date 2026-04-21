import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'EZ Inventory',
  description: 'Documentation for EZ Inventory',
  base: process.env.GITHUB_ACTIONS ? '/ezinventory/' : '/',
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/' },
      { text: 'Architecture', link: '/architecture' },
      { text: 'Testing (App)', link: '/testing-app' },
      { text: 'Operations', link: '/operations' },
      { text: 'Release', link: '/release-strategy' }
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
    socialLinks: [{ icon: 'github', link: 'https://github.com/tobiaswaelde/ezinventory' }]
  }
});
