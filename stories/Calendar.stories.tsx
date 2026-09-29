import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Calendar as Cal } from '../Calendar';

// Storybook's date controls pass epoch numbers, not Dates.
const toDate = (value: unknown) =>
  typeof value === 'number' ? new Date(value) : (value as Date | undefined);

const meta = {
  title: 'Example/Calendar',
  component: Cal,
  argTypes: {
    value: { control: false },
    defaultValue: { control: 'date' },
    minDate: { control: 'date' },
    maxDate: { control: 'date' },
    showSecondaryDate: { control: 'boolean' },
  },
  args: { onChange: fn(), onMonthChange: fn() },
  // defaultValue is only read on mount, so remount when its control changes.
  render: (args) => {
    const defaultValue = toDate(args.defaultValue);
    return (
      <Cal
        key={String(defaultValue)}
        {...(args as object)}
        defaultValue={defaultValue}
        minDate={toDate(args.minDate)}
        maxDate={toDate(args.maxDate)}
      />
    );
  },
} satisfies Meta<typeof Cal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Calendar: Story = {
  args: {
    calendar: 'AD',
    showSecondaryDate: true,
  },
};

export const Range: Story = {
  args: {
    mode: 'range',
    weekendDays: [6],
  },
};
