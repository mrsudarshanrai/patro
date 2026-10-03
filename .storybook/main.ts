import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../package/**/*.mdx', '../package/**/*.stories.@(js|jsx|mjs|ts|tsx)'],

  // Serves the logo at the path README.md uses, for the Introduction page.
  staticDirs: [{ from: '../docs/public', to: '/docs/public' }],

  addons: ['@storybook/addon-links', '@storybook/addon-onboarding', '@storybook/addon-docs'],

  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
};
export default config;
