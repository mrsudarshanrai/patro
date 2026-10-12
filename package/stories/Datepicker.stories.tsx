import { FormEvent, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Datepicker, type DateRange, type PatroDate } from '../index';
import { addDays, holidayClass, Readout, toDate } from './helpers';

const meta = {
  title: 'Datepicker',
  component: Datepicker,
  tags: ['autodocs'],
  argTypes: {
    value: { control: false },
    open: { control: false },
    defaultValue: { control: 'date' },
    minDate: { control: 'date' },
    maxDate: { control: 'date' },
    defaultMonth: { control: 'date' },
    today: { control: 'date' },
    month: { control: false },
    presets: { control: false },
    showSecondaryDate: { control: 'boolean' },
    numberOfMonths: { control: { type: 'number', min: 1, max: 3 } },
  },
  args: {
    label: 'Date',
    onChange: fn(),
    onMonthChange: fn(),
    onOpenChange: fn(),
    onFocus: fn(),
    onBlur: fn(),
  },
  // defaultValue is only read on mount, so remount when its control changes.
  render: (args) => {
    const defaultValue = toDate(args.defaultValue);
    return (
      <Datepicker
        key={String(defaultValue)}
        {...(args as object)}
        defaultValue={defaultValue}
        defaultMonth={toDate(args.defaultMonth)}
        today={toDate(args.today)}
        minDate={toDate(args.minDate)}
        maxDate={toDate(args.maxDate)}
      />
    );
  },
} satisfies Meta<typeof Datepicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const BikramSambat: Story = {
  name: 'Bikram Sambat (BS)',
  args: { calendar: 'BS', label: 'मिति' },
};

export const Placeholder: Story = {
  name: 'Empty with placeholder',
  args: { defaultValue: null, placeholder: 'Pick your arrival day' },
};

export const EmptyBS: Story = {
  name: 'Empty (BS default placeholder)',
  args: { calendar: 'BS', label: 'मिति', defaultValue: null },
};

export const Clearable: Story = {
  args: { clearable: true, defaultValue: new Date() },
};

export const Range: Story = {
  args: { mode: 'range', label: 'Stay', clearable: true },
};

export const RangeBS: Story = {
  name: 'Range (BS)',
  args: {
    mode: 'range',
    calendar: 'BS',
    label: 'बिदा',
    defaultValue: { start: new Date(2026, 9, 20), end: new Date(2026, 9, 27) },
    weekendDays: [6],
    dayClassName: holidayClass,
  },
};

export const States: Story = {
  name: 'Disabled / read-only / invalid',
  render: () => (
    <div className='story-row'>
      <Datepicker label='Disabled' disabled />
      <Datepicker label='Read-only' readOnly defaultValue={new Date()} />
      <Datepicker label='Invalid' invalid aria-describedby='invalid-help' />
      <span id='invalid-help' hidden>
        Please choose a date
      </span>
    </div>
  ),
};

export const CustomText: Story = {
  name: 'formatValue',
  args: {
    calendar: 'BS',
    defaultValue: new Date(),
    formatValue: ({ bs, ad }: PatroDate) => `${bs} BS (${ad} AD)`,
  },
};

export const LimitsAndDisabledDays: Story = {
  name: 'minDate / maxDate / isDateDisabled',
  args: {
    label: 'Appointment (next 30 days, no Saturdays)',
    defaultValue: null,
    minDate: new Date(),
    maxDate: new Date(Date.now() + 30 * 86400000),
    weekendDays: [6],
    isDateDisabled: ({ date }: PatroDate) => date.getDay() === 6,
    showTodayButton: true,
  },
};

export const Localized: Story = {
  name: 'locale / numerals',
  render: () => (
    <div className='story-row'>
      <Datepicker
        label='BS in English'
        calendar='BS'
        locale='en'
        numerals='latin'
        defaultValue={new Date()}
      />
      <Datepicker
        label='AD in Nepali'
        locale='ne'
        numerals='devanagari'
        defaultValue={new Date()}
      />
    </div>
  ),
};

export const StayOpen: Story = {
  name: 'closeOnSelect={false}',
  args: { closeOnSelect: false },
};

const ControlledValue = () => {
  const [value, setValue] = useState<Date | null>(null);
  return (
    <div>
      <Datepicker
        label='Controlled'
        value={value}
        onChange={(picked) => setValue(picked?.date ?? null)}
      />
      <p>
        <button className='story-button' onClick={() => setValue(new Date())}>
          Today
        </button>{' '}
        <button className='story-button' onClick={() => setValue(null)}>
          Clear
        </button>
      </p>
      <Readout label='value'>{value ? value.toDateString() : 'null'}</Readout>
    </div>
  );
};

export const Controlled: Story = {
  render: () => <ControlledValue />,
};

const ControlledRange = () => {
  const [range, setRange] = useState<DateRange>({ start: null, end: null });
  return (
    <div>
      <Datepicker
        mode='range'
        label='Controlled range'
        value={range}
        onChange={({ start, end }) =>
          setRange({ start: start?.date ?? null, end: end?.date ?? null })
        }
      />
      <Readout label='value'>
        {`start: ${range.start?.toDateString() ?? 'null'}\nend:   ${
          range.end?.toDateString() ?? 'null'
        }`}
      </Readout>
    </div>
  );
};

export const ControlledRangeValue: Story = {
  name: 'Controlled range',
  render: () => <ControlledRange />,
};

const ControlledOpen = () => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <p>
        <button className='story-button' onClick={() => setOpen(!open)}>
          {open ? 'Close' : 'Open'} from outside
        </button>
      </p>
      <Datepicker label='Controlled popover' open={open} />
    </div>
  );
};

export const ControlledPopover: Story = {
  name: 'open / onOpenChange',
  render: () => <ControlledOpen />,
};

export const Placement: Story = {
  name: 'placement="top-start"',
  args: { placement: 'top-start' },
  render: (args) => (
    <div style={{ paddingTop: 440 }}>
      <Datepicker {...(args as object)} />
    </div>
  ),
};

export const Portal: Story = {
  name: 'portal (inside overflow: hidden)',
  render: () => (
    <div className='story-row'>
      <div>
        <p className='story-note'>Without portal: clipped by the box.</p>
        <div className='story-clip'>
          <Datepicker label='Clipped' />
        </div>
      </div>
      <div>
        <p className='story-note'>
          With <code>portal</code>: rendered in <code>document.body</code>.
        </p>
        <div className='story-clip'>
          <Datepicker label='Portal' portal />
        </div>
      </div>
    </div>
  ),
};

export const DarkTheme: Story = {
  args: { theme: 'dark', calendar: 'BS', label: 'मिति', clearable: true, defaultValue: new Date() },
  render: (args) => (
    <div className='story-dark' style={{ minHeight: 440 }}>
      <Datepicker {...(args as object)} />
    </div>
  ),
};

export const Editable: Story = {
  name: 'editable (type a date)',
  args: { editable: true, clearable: true, defaultValue: new Date() },
  render: (args) => (
    <div>
      <p className='story-note'>
        Type <code>2026-10-29</code>, <code>2026/10/29</code> or <code>2026.10.29</code>, then Enter
        or Tab. Text that isn&rsquo;t a date is marked invalid on Enter and reverts when you leave.
        ArrowDown opens the calendar.
      </p>
      <Datepicker {...(args as object)} defaultValue={toDate(args.defaultValue)} />
    </div>
  ),
};

export const EditableBS: Story = {
  name: 'editable (BS, Devanagari or Latin digits)',
  args: { editable: true, calendar: 'BS', label: 'मिति', defaultValue: null },
  render: (args) => (
    <div>
      <p className='story-note'>
        BS dates can be typed as <code>२०८३-०७-१२</code> or <code>2083-07-12</code>; they&rsquo;re
        shown back in the calendar&rsquo;s own digits.
      </p>
      <Datepicker {...(args as object)} />
    </div>
  ),
};

export const DateOfBirth: Story = {
  name: 'Date of birth (editable + defaultMonth)',
  args: {
    label: 'Date of birth',
    editable: true,
    defaultValue: null,
    defaultMonth: new Date(2000, 0, 1),
    maxDate: new Date(),
  },
};

export const Presets: Story = {
  args: {
    label: 'Follow-up',
    defaultValue: null,
    minDate: new Date(),
    presets: [
      { label: 'Tomorrow', value: () => addDays(new Date(), 1) },
      { label: 'In a week', value: () => addDays(new Date(), 7) },
      { label: 'In a month', value: () => addDays(new Date(), 30) },
    ],
  },
};

export const Stay: Story = {
  name: 'Range: two months, presets, 2–14 nights',
  args: {
    mode: 'range',
    label: 'Stay',
    clearable: true,
    numberOfMonths: 2,
    minDays: 2,
    maxDays: 14,
    minDate: new Date(),
    presets: [
      { label: 'This weekend', value: () => weekend(0) },
      { label: 'Next weekend', value: () => weekend(7) },
      { label: 'Next 7 days', value: () => ({ start: new Date(), end: addDays(new Date(), 6) }) },
    ],
  },
};

// Friday to Sunday of this week (or `offset` days later).
const weekend = (offset: number) => {
  const today = new Date();
  const friday = addDays(today, ((5 - today.getDay() + 7) % 7) + offset);
  return { start: friday, end: addDays(friday, 2) };
};

export const TwoMonthsBS: Story = {
  name: 'Range (BS, two months)',
  args: { mode: 'range', calendar: 'BS', label: 'बिदा', numberOfMonths: 2, weekendDays: [6] },
};

const LayoutShiftDemo = () => {
  const [notices, setNotices] = useState(0);
  return (
    <div>
      <p className='story-note'>
        Open the picker, then add a notice above it: the popover should stay attached to the field.
      </p>
      <button className='story-button' onClick={() => setNotices(notices + 1)}>
        Add a notice above
      </button>
      {Array.from({ length: notices }, (_, i) => (
        <p key={i} className='story-note'>
          Notice {i + 1}: something appeared and pushed the form down.
        </p>
      ))}
      <Datepicker label='Date' closeOnSelect={false} />
    </div>
  );
};

export const LayoutShift: Story = {
  name: 'Layout shift while open',
  render: () => <LayoutShiftDemo />,
};

const StringState = () => {
  const [dob, setDob] = useState<string | null>('2000-05-14');
  return (
    <div>
      <Datepicker
        label='Date of birth'
        calendar='BS'
        value={dob}
        minDate='1940-01-01'
        maxDate='2010-12-31'
        onChange={(picked) => setDob(picked?.ad ?? null)}
        clearable
      />
      <Readout label='state (a string, as stored in a database)'>{JSON.stringify(dob)}</Readout>
    </div>
  );
};

export const StringDates: Story = {
  name: 'String dates',
  render: () => (
    <div>
      <p className='story-note'>
        Every date prop takes an AD <code>&apos;YYYY-MM-DD&apos;</code> string as well as a{' '}
        <code>Date</code>, so state kept as strings needs no conversion, and Server Components can
        pass dates safely.
      </p>
      <StringState />
    </div>
  ),
};

const DialogWithPicker = ({ container }: { container: boolean }) => {
  const [content, setContent] = useState<HTMLDivElement | null>(null);
  return (
    <Dialog.Root>
      <Dialog.Trigger className='story-button'>
        {container ? 'With portalContainer' : 'Without portalContainer'}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className='story-overlay' />
        <Dialog.Content ref={setContent} className='story-dialog' aria-describedby={undefined}>
          <Dialog.Title className='story-dialog-title'>Book a stay</Dialog.Title>
          <div className='story-dialog-body'>
            <Datepicker label='Check-in' {...(container && { portalContainer: content })} />
            <p className='story-note'>
              This area scrolls, so it clips anything that sticks out of it.
            </p>
          </div>
          <Dialog.Close className='story-button'>Close</Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export const PortalContainer: Story = {
  name: 'portalContainer (inside a modal)',
  render: () => (
    <div>
      <p className='story-note'>
        Inside a modal, a scrolling area cuts the popover off. <code>portal</code> can&apos;t help
        (the modal blocks clicks outside itself), so portal it into the dialog&apos;s content
        instead. Escape closes the popover first, then the dialog.
      </p>
      <div className='story-row'>
        <DialogWithPicker container={false} />
        <DialogWithPicker container />
      </div>
    </div>
  ),
};

export const FieldProps: Story = {
  name: 'Field props: data-*, aria-labelledby, inputClassName, inputMode',
  render: () => (
    <fieldset className='story-fieldset'>
      <legend id='checkin-legend'>Check-in date</legend>
      <Datepicker
        aria-labelledby='checkin-legend'
        data-testid='checkin'
        inputClassName='story-input-custom'
        editable
        inputMode='numeric'
      />
      <p className='story-note'>
        Named by the <code>legend</code>, found in tests with{' '}
        <code>getByTestId(&apos;checkin&apos;)</code>, styled by your own class, and a numeric
        keyboard on phones.
      </p>
    </fieldset>
  ),
};

const ResettableForm = () => {
  const [submitted, setSubmitted] = useState('');
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(JSON.stringify(Object.fromEntries(new FormData(event.currentTarget)), null, 2));
  };
  return (
    <form onSubmit={onSubmit}>
      <Datepicker label='Date' name='date' defaultValue='2026-10-15' />
      <p className='story-actions'>
        <button type='submit' className='story-button'>
          Submit
        </button>
        <button type='reset' className='story-button'>
          Reset
        </button>
      </p>
      {submitted && <Readout label='submitted'>{submitted}</Readout>}
    </form>
  );
};

export const FormReset: Story = {
  name: 'Native form reset',
  render: () => (
    <div>
      <p className='story-note'>
        Pick another day, then press Reset: the field goes back to its <code>defaultValue</code> and{' '}
        <code>onChange</code> is called.
      </p>
      <ResettableForm />
    </div>
  ),
};

export const InvalidDates: Story = {
  name: 'Invalid dates',
  render: () => (
    <div className='story-row'>
      <div>
        <p className='story-note'>
          <code>value=&apos;15/10/2026&apos;</code>: not a date, so the field is empty and a warning
          is logged in development.
        </p>
        <Datepicker label='Malformed' value='15/10/2026' />
      </div>
      <div>
        <p className='story-note'>
          <code>value=&apos;1900-01-01&apos;</code>: outside the supported range (1921–2043),
          treated the same way.
        </p>
        <Datepicker label='Unsupported' value='1900-01-01' />
      </div>
    </div>
  ),
};
