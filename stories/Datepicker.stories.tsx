import type { Meta, StoryObj } from '@storybook/react-vite';
import { Datepicker as DP } from '../Datepicker';

const meta = {
  title: 'Example/Datepicker',
  component: DP,
  argTypes: { value: { control: false } },
} satisfies Meta<typeof DP>;

export default meta;
type Story = StoryObj<typeof meta>;

// Storybook's date control passes an epoch number, not a Date.
const toDate = (value: unknown): Date | undefined =>
  typeof value === 'number' ? new Date(value) : (value as Date | undefined);

export const Datepicker: Story = {
  args: {
    calendar: 'AD',
    label: 'Date',
  },
  // defaultValue is only read on mount, so remount when the control changes.
  render: (args) => {
    const defaultValue = toDate(args.defaultValue);
    return <DP key={String(defaultValue)} {...(args as object)} defaultValue={defaultValue} />;
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
