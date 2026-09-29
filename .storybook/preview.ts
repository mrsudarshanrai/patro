import '../scss/style.scss';
import type { Preview } from '@storybook/react-vite';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
      },
    },
    options: {
      storySort: {
        order: ['Introduction', 'Calendar', 'Datepicker', 'Templates', 'Utilities'],
      },
    },
  },
};

export default preview;
