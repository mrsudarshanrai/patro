import type { Meta, StoryObj } from '@storybook/react';
import { Calendar as Cal } from '../Calendar';

const meta = {
  title: 'Example/Calendar',
  component: Cal,
} satisfies Meta<typeof Cal>;

export default meta;
type Story = StoryObj<typeof meta>;

// Storybook's inferred `date` control stores/passes the value as an epoch
// number, not a Date instance, even though the prop is typed as `Date`.
const toDate = (value: unknown): Date | undefined =>
  typeof value === 'number' ? new Date(value) : (value as Date | undefined);

export const Calendar: Story = {
  args: {
    showExtra: true,
  },
  render: (args) => <Cal {...args} defaultDate={toDate(args.defaultDate)} />,
};
