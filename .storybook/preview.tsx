import '../package/scss/style.scss';
import type { Preview, Decorator } from '@storybook/react-vite';
import { Analytics } from '@vercel/analytics/react';
import React from 'react';

const withAnalytics: Decorator = (Story) => (
  <>
    <Story />
    <Analytics />
  </>
);

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
      },
    },
    options: {
      storySort: {
        order: ['Introduction', 'Calendar', 'Datepicker', 'Utilities'],
      },
    },
  },
  decorators: [withAnalytics],
};

export default preview;
