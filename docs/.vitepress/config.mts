import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'patro',
  description: 'React calendar and datepicker for Gregorian (AD) and Bikram Sambat (BS) dates',
  lastUpdated: true,
  cleanUrls: true,
  head: [['link', { rel: 'icon', type: 'image/svg+xml', href: '/patro-logo.svg' }]],

  vite: {
    // The home page demo is React (TSX) inside this Vue site.
    esbuild: { jsx: 'automatic' },
    // patro is linked from the parent repo, which has its own React; use one copy.
    resolve: { dedupe: ['react', 'react-dom'] },
    optimizeDeps: { include: ['react', 'react-dom/client', 'patrojs'] },
  },

  themeConfig: {
    logo: '/patro-logo.svg',
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Reference', link: '/reference/props' },
      // Storybook is a separate app built into /storybook/; _self makes it a full page load.
      { text: 'Storybook', link: '/storybook/', target: '_self' },
      { text: 'npm', link: 'https://www.npmjs.com/package/patrojs' },
    ],

    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting started', link: '/guide/getting-started' },
          { text: 'Controlled vs uncontrolled', link: '/guide/controlled-uncontrolled' },
          { text: 'Date ranges', link: '/guide/date-ranges' },
          { text: 'Holidays, events & presets', link: '/guide/days-and-presets' },
          { text: 'Theming', link: '/guide/theming' },
          { text: 'Localization', link: '/guide/localization' },
          { text: 'Keyboard & accessibility', link: '/guide/keyboard-navigation' },
          { text: 'Forms', link: '/guide/forms' },
          { text: 'Server rendering', link: '/guide/server-rendering' },
        ],
      },
      {
        text: 'Reference',
        items: [
          { text: 'Props', link: '/reference/props' },
          { text: 'Types', link: '/reference/types' },
          { text: 'AD ↔ BS utilities', link: '/reference/utilities' },
        ],
      },
    ],

    socialLinks: [{ icon: 'github', link: 'https://github.com/mrsudarshanrai/patro' }],

    search: {
      provider: 'local',
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'patro',
    },
  },
});
