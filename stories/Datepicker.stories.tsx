import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Datepicker as DP } from '../Datepicker';

// Storybook's date controls pass epoch numbers, not Dates.
const toDate = (value: unknown) =>
  typeof value === 'number' ? new Date(value) : (value as Date | undefined);

const meta = {
  title: 'Example/Datepicker',
  component: DP,
  argTypes: {
    value: { control: false },
    defaultValue: { control: 'date' },
    minDate: { control: 'date' },
    maxDate: { control: 'date' },
    showSecondaryDate: { control: 'boolean' },
  },
  args: { onChange: fn(), onMonthChange: fn(), onOpenChange: fn(), onFocus: fn(), onBlur: fn() },
  // defaultValue is only read on mount, so remount when its control changes.
  render: (args) => {
    const defaultValue = toDate(args.defaultValue);
    return (
      <DP
        key={String(defaultValue)}
        {...(args as object)}
        defaultValue={defaultValue}
        minDate={toDate(args.minDate)}
        maxDate={toDate(args.maxDate)}
      />
    );
  },
} satisfies Meta<typeof DP>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Datepicker: Story = {
  args: {
    calendar: 'AD',
    label: 'Date',
  },
};

export const Empty: Story = {
  args: {
    calendar: 'BS',
    label: 'मिति',
    defaultValue: null,
  },
};

export const Range: Story = {
  args: {
    mode: 'range',
    label: 'Stay',
    clearable: true,
  },
};
