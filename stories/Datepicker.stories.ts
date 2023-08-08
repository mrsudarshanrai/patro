import type { Meta, StoryObj } from '@storybook/react';
import { Datepicker } from '../Datepicker';

const meta = {
  title: 'Example/Datepicker',
  component: Datepicker,
} satisfies Meta<typeof Datepicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Calendar: Story = {
  args: {
    showExtra: true,
  },
};
