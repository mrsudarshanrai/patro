import { defineConfig } from 'vitepress';
import { version } from '../../package.json';

export default defineConfig({
  title: 'patro',
  description: 'React calendar and datepicker for Gregorian (AD) and Bikram Sambat (BS) dates',
  lastUpdated: true,
  cleanUrls: true,
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/patro-logo.svg' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: 'patro' }],
    ['meta', { property: 'og:title', content: 'patro: AD and BS dates for React' }],
    [
      'meta',
      {
        property: 'og:description',
        content: 'React calendar and datepicker for Gregorian (AD) and Bikram Sambat (BS) dates',
      },
    ],
    ['meta', { property: 'og:url', content: 'https://patro.sudarshanrai.com.np/' }],
    ['meta', { property: 'og:image', content: 'https://patro.sudarshanrai.com.np/og-image.png' }],
    ['meta', { property: 'og:image:width', content: '2400' }],
    ['meta', { property: 'og:image:height', content: '1256' }],
    [
      'meta',
      {
        property: 'og:image:alt',
        content: 'patro: AD and BS dates for React, with a Bikram Sambat calendar',
      },
    ],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:image', content: 'https://patro.sudarshanrai.com.np/og-image.png' }],
  ],

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
      { text: 'Examples', link: '/examples/' },
      // Storybook is a separate app built into /storybook/; _self makes it a full page load.
      { text: 'Storybook', link: '/storybook/', target: '_self' },
      {
        text: `v${version}`,
        items: [
          {
            text: 'Changelog',
            link: 'https://github.com/mrsudarshanrai/patro/blob/main/CHANGELOG.md',
          },
          { text: 'npm', link: 'https://www.npmjs.com/package/patrojs' },
        ],
      },
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
          { text: 'Versioning', link: '/reference/versioning' },
        ],
      },
      {
        text: 'Examples',
        link: '/examples/',
        items: [
          { text: 'Festival calendar', link: '/examples/calendar' },
          { text: 'Registration form', link: '/examples/registration' },
          { text: 'Hotel booking', link: '/examples/booking' },
          { text: 'Leave request (BS)', link: '/examples/leave' },
          { text: 'Reschedule in a dialog', link: '/examples/reschedule' },
          { text: 'Date converter', link: '/examples/converter' },
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
