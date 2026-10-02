import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../package/**/*.mdx', '../package/**/*.stories.@(js|jsx|mjs|ts|tsx)'],

  addons: ['@storybook/addon-links', '@storybook/addon-onboarding', '@storybook/addon-docs'],

  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
};
export default config;
