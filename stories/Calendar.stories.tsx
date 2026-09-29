import { useState, type CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Calendar, type PatroDate } from '../index';
import { HOLIDAYS, holidayClass, json, Readout, toDate } from './helpers';

const meta = {
  title: 'Calendar',
  component: Calendar,
  tags: ['autodocs'],
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
      <Calendar
        key={String(defaultValue)}
        {...(args as object)}
        defaultValue={defaultValue}
        minDate={toDate(args.minDate)}
        maxDate={toDate(args.maxDate)}
      />
    );
  },
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const BikramSambat: Story = {
  name: 'Bikram Sambat (BS)',
  args: { calendar: 'BS' },
};

export const WithoutSecondaryDate: Story = {
  args: { calendar: 'BS', showSecondaryDate: false },
};

export const Range: Story = {
  args: { mode: 'range' },
};

export const RangeWithInitialValue: Story = {
  args: {
    mode: 'range',
    defaultValue: { start: new Date(2026, 9, 18), end: new Date(2026, 9, 25) },
  },
};

export const Empty: Story = {
  name: 'Empty (defaultValue null)',
  args: { defaultValue: null },
};

export const EnglishBS: Story = {
  name: 'BS in English with Latin digits',
  args: { calendar: 'BS', locale: 'en', numerals: 'latin' },
};

export const NepaliAD: Story = {
  name: 'AD in Nepali with Devanagari digits',
  args: { calendar: 'AD', locale: 'ne', numerals: 'devanagari' },
};

export const MinAndMaxDate: Story = {
  name: 'minDate / maxDate',
  args: { minDate: new Date(2026, 9, 10), maxDate: new Date(2026, 10, 20) },
};

export const DisabledSaturdays: Story = {
  name: 'isDateDisabled (Saturdays)',
  args: {
    calendar: 'BS',
    weekendDays: [6],
    isDateDisabled: ({ date }: PatroDate) => date.getDay() === 6,
  },
};

export const WeekendsAndHolidays: Story = {
  name: 'weekendDays + dayClassName (holidays)',
  args: {
    calendar: 'BS',
    defaultValue: new Date(2026, 9, 21),
    weekendDays: [6],
    dayClassName: holidayClass,
  },
  render: (args) => (
    <div>
      <Calendar {...(args as object)} />
      <ul className='story-legend'>
        {Object.entries(HOLIDAYS).map(([bs, name]) => (
          <li key={bs}>
            <b>{bs}</b> {name}
          </li>
        ))}
      </ul>
    </div>
  ),
};

export const WeekStartsMonday: Story = {
  args: { weekStartsOn: 1 },
};

export const VariableWeeks: Story = {
  name: 'fixedWeeks={false}',
  args: { fixedWeeks: false, defaultValue: new Date(2026, 1, 10) },
};

export const TodayButton: Story = {
  args: { showTodayButton: true, defaultValue: new Date(2026, 0, 5) },
};

export const DarkTheme: Story = {
  args: { theme: 'dark', calendar: 'BS' },
  render: (args) => (
    <div className='story-dark'>
      <Calendar {...(args as object)} />
    </div>
  ),
};

export const CustomColours: Story = {
  name: 'Custom colours (CSS tokens)',
  args: {
    style: {
      '--patro-accent': '#0f766e',
      '--patro-today': '#0f766e',
      '--patro-sel-bg': '#ccfbf1',
      '--patro-sel-text': '#134e4a',
      '--patro-sel-sub': '#0f766e',
      '--patro-range-bg': 'color-mix(in srgb, #0f766e 14%, transparent)',
      '--patro-radius-popover': '4px',
      '--patro-radius-cell': '999px',
    } as CSSProperties,
  },
};

const ControlledCalendar = () => {
  const [value, setValue] = useState<Date | null>(new Date(2026, 9, 29));
  return (
    <div>
      <p className='story-note'>
        The parent owns the value; the calendar only calls <code>onChange</code>.
      </p>
      <div className='story-row'>
        <Calendar value={value} onChange={(picked) => setValue(picked?.date ?? null)} />
        <div>
          <button className='story-button' onClick={() => setValue(new Date())}>
            Set to today
          </button>{' '}
          <button className='story-button' onClick={() => setValue(null)}>
            Clear
          </button>
          <Readout label='value'>{value ? value.toDateString() : 'null'}</Readout>
        </div>
      </div>
    </div>
  );
};

export const Controlled: Story = {
  render: () => <ControlledCalendar />,
};

const EventLog = () => {
  const [picked, setPicked] = useState<PatroDate | null>(null);
  const [month, setMonth] = useState<{ start: PatroDate; end: PatroDate } | null>(null);
  return (
    <div className='story-row'>
      <Calendar calendar='BS' onChange={setPicked} onMonthChange={setMonth} />
      <div>
        <Readout label='onChange'>{json(picked)}</Readout>
        <Readout label='onMonthChange'>
          {month ? `${month.start.bs} → ${month.end.bs}\n${month.start.ad} → ${month.end.ad}` : '—'}
        </Readout>
      </div>
    </div>
  );
};

export const Events: Story = {
  name: 'onChange / onMonthChange values',
  render: () => <EventLog />,
};

export const SupportedRangeEdges: Story = {
  name: 'Edges of the supported range',
  render: () => (
    <div>
      <p className='story-note'>
        Dates are supported from AD 1921-04-13 (BS 1978-01-01) to AD 2043-04-14 (BS 2099-12-31).
        Days outside are disabled and navigation stops at the edges.
      </p>
      <div className='story-row'>
        <Calendar defaultValue={new Date(1921, 3, 20)} />
        <Calendar calendar='BS' defaultValue={new Date(2043, 3, 1)} />
      </div>
    </div>
  ),
};
