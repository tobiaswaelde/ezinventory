import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'EZ Inventory',
  description: 'Documentation for EZ Inventory',
  base: process.env.GITHUB_ACTIONS ? '/ezinventory/' : '/',
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/' },
      { text: 'Architecture', link: '/architecture' },
      { text: 'Operations', link: '/operations' }
    ],
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Overview', link: '/' },
          { text: 'Architecture', link: '/architecture' },
          { text: 'Operations', link: '/operations' }
        ]
      }
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/tobiaswaelde/ezinventory' }]
  }
});
