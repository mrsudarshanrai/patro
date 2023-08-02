import type { Meta, StoryObj } from '@storybook/react';
import { Calendar as Cal } from '../Calendar';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: 'Example/Calendar',
  component: Cal,
} satisfies Meta<typeof Cal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Calendar: Story = {
  args: {
    showExtra: true,
  },
};
