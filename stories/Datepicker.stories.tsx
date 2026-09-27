import type { Meta, StoryObj } from '@storybook/react';
import { Datepicker } from '../Datepicker';

const meta = {
  title: 'Example/Datepicker',
  component: Datepicker,
} satisfies Meta<typeof Datepicker>;

export default meta;
type Story = StoryObj<typeof meta>;

const toDate = (value: unknown): Date | undefined =>
  typeof value === 'number' ? new Date(value) : (value as Date | undefined);

export const Calendar: Story = {
  args: {
    showExtra: true,
    calendarType: 'AD',
  },
  render: (args) => <Datepicker {...args} defaultDate={toDate(args.defaultDate)} />,
};
