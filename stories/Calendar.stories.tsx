import type { Meta, StoryObj } from '@storybook/react-vite';
import { Calendar as Cal } from '../Calendar';

const meta = {
  title: 'Example/Calendar',
  component: Cal,
  argTypes: { value: { control: false } },
} satisfies Meta<typeof Cal>;

export default meta;
type Story = StoryObj<typeof meta>;

// Storybook's date control passes an epoch number, not a Date.
const toDate = (value: unknown): Date | undefined =>
  typeof value === 'number' ? new Date(value) : (value as Date | undefined);

export const Calendar: Story = {
  args: {
    calendar: 'AD',
    showSecondaryDate: true,
  },
  // defaultValue is only read on mount, so remount when the control changes.
  render: (args) => {
    const defaultValue = toDate(args.defaultValue);
    return <Cal key={String(defaultValue)} {...args} defaultValue={defaultValue} />;
  },
};
