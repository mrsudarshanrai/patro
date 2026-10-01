import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'patro',
  description: 'A React AD ↔ BS (Bikram Sambat) calendar and datepicker',
  lastUpdated: true,
  cleanUrls: true,

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Reference', link: '/reference/props' },
      { text: 'Storybook', link: '/storybook' },
      { text: 'npm', link: 'https://www.npmjs.com/package/patro' },
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
