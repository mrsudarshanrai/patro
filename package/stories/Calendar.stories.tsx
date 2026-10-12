import { useState, type CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Calendar, type DateRange, type PatroDate } from '../index';
import { addDays, HOLIDAYS, holidayClass, json, Readout, toDate } from './helpers';

const meta = {
  title: 'Calendar',
  component: Calendar,
  tags: ['autodocs'],
  argTypes: {
    value: { control: false },
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
  args: { onChange: fn(), onMonthChange: fn() },
  // defaultValue is only read on mount, so remount when its control changes.
  render: (args) => {
    const defaultValue = toDate(args.defaultValue);
    const defaultMonth = toDate(args.defaultMonth);
    return (
      <Calendar
        key={`${defaultValue}|${defaultMonth}`}
        {...(args as object)}
        defaultValue={defaultValue}
        defaultMonth={defaultMonth}
        today={toDate(args.today)}
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

export const TodaySelected: Story = {
  name: 'Starting on today (defaultValue)',
  args: { defaultValue: new Date() },
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
      '--patro-selected-bg': '#ccfbf1',
      '--patro-selected-text': '#134e4a',
      '--patro-selected-secondary': '#0f766e',
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

export const DefaultMonth: Story = {
  name: 'defaultMonth (date of birth)',
  args: { defaultMonth: new Date(2000, 0, 1), maxDate: new Date() },
};

const ControlledMonthDemo = () => {
  const [month, setMonth] = useState(new Date(2026, 9, 1));
  const jump = (months: number) =>
    setMonth(new Date(month.getFullYear(), month.getMonth() + months, 1));
  return (
    <div className='story-row'>
      <Calendar month={month} onMonthChange={({ start }) => setMonth(start.date)} />
      <div>
        <p className='story-note'>
          The parent owns the displayed month. Navigation only calls <code>onMonthChange</code>.
        </p>
        <button className='story-button' onClick={() => jump(-12)}>
          −1 year
        </button>{' '}
        <button className='story-button' onClick={() => jump(12)}>
          +1 year
        </button>{' '}
        <button className='story-button' onClick={() => setMonth(new Date())}>
          This month
        </button>
        <Readout label='month'>{month.toDateString()}</Readout>
      </div>
    </div>
  );
};

export const ControlledMonth: Story = {
  name: 'month / onMonthChange (controlled)',
  render: () => <ControlledMonthDemo />,
};

export const DayContent: Story = {
  name: 'dayContent + dayLabel (event dots)',
  args: {
    calendar: 'BS',
    defaultValue: new Date(2026, 9, 21),
    weekendDays: [6],
    dayContent: ({ bs }: PatroDate) => HOLIDAYS[bs] && <i className='story-dot' />,
    dayLabel: ({ bs }: PatroDate) => HOLIDAYS[bs],
  },
  render: (args) => (
    <div>
      <p className='story-note'>
        <code>dayContent</code> draws in the corner; <code>dayLabel</code> adds the holiday name to
        what screen readers announce for that day.
      </p>
      <Calendar {...(args as object)} />
    </div>
  ),
};

export const Presets: Story = {
  args: {
    presets: [
      { label: 'Today', value: () => new Date() },
      { label: 'Tomorrow', value: () => addDays(new Date(), 1) },
      { label: 'In a week', value: () => addDays(new Date(), 7) },
      { label: 'In a month', value: () => addDays(new Date(), 30) },
    ],
  },
};

export const RangePresets: Story = {
  name: 'Presets (range)',
  args: {
    mode: 'range',
    maxDays: 14,
    presets: [
      { label: 'Next 7 days', value: () => ({ start: new Date(), end: addDays(new Date(), 6) }) },
      { label: 'Next 14 days', value: () => ({ start: new Date(), end: addDays(new Date(), 13) }) },
      { label: 'Next 30 days', value: () => ({ start: new Date(), end: addDays(new Date(), 29) }) },
    ],
  },
  render: (args) => (
    <div>
      <p className='story-note'>
        With <code>maxDays={'{14}'}</code>, &ldquo;Next 30 days&rdquo; is disabled. The preset
        matching the value is highlighted.
      </p>
      <Calendar {...(args as object)} />
    </div>
  ),
};

// Booked nights a stay can't include.
const BOOKED = new Set([7, 8, 15, 22].map((day) => `2026-11-${String(day).padStart(2, '0')}`));

const RangeRulesDemo = () => {
  const [range, setRange] = useState<DateRange>({ start: null, end: null });
  return (
    <div className='story-row'>
      <Calendar
        mode='range'
        defaultMonth={new Date(2026, 10, 1)}
        minDays={2}
        maxDays={7}
        isDateDisabled={({ ad }) => BOOKED.has(ad)}
        excludeDisabled
        onChange={({ start, end }) =>
          setRange({ start: start?.date ?? null, end: end?.date ?? null })
        }
      />
      <div>
        <p className='story-note'>
          <code>minDays={'{2}'}</code>, <code>maxDays={'{7}'}</code> and{' '}
          <code>excludeDisabled</code> with booked nights disabled. Picking an end that breaks a
          rule starts a new range there, and the hover preview only shows valid ends.
        </p>
        <Readout label='value'>
          {`start: ${range.start?.toDateString() ?? 'null'}\nend:   ${
            range.end?.toDateString() ?? 'null'
          }`}
        </Readout>
      </div>
    </div>
  );
};

export const RangeRules: Story = {
  name: 'minDays / maxDays / excludeDisabled',
  render: () => <RangeRulesDemo />,
};

export const TwoMonths: Story = {
  name: 'numberOfMonths={2}',
  args: { mode: 'range', numberOfMonths: 2 },
};

export const TwoMonthsBS: Story = {
  name: 'numberOfMonths={2} (BS)',
  args: { calendar: 'BS', numberOfMonths: 2, weekendDays: [6], dayClassName: holidayClass },
};

export const Labels: Story = {
  name: 'labels (custom accessible names)',
  args: {
    showTodayButton: true,
    labels: { previousMonth: 'Mois précédent', nextMonth: 'Mois suivant', today: 'Aujourd’hui' },
  },
  render: (args) => (
    <div>
      <p className='story-note'>
        Accessible names and button text default to English or Nepali, following <code>locale</code>
        . <code>labels</code> overrides any of them.
      </p>
      <Calendar {...(args as object)} />
    </div>
  ),
};

export const FixedToday: Story = {
  name: 'today (pinned date)',
  args: { today: new Date(2030, 0, 15), showTodayButton: true },
  render: (args) => (
    <div>
      <p className='story-note'>
        <code>today</code> replaces the visitor&rsquo;s clock: for server rendering the month, or
        pinning dates in tests and screenshots.
      </p>
      <Calendar {...(args as object)} today={toDate(args.today)} />
    </div>
  ),
};

export const Keyboard: Story = {
  render: () => (
    <div className='story-row'>
      <Calendar defaultValue={new Date()} numberOfMonths={2} />
      <table className='story-keys'>
        <tbody>
          {[
            ['← → ↑ ↓', 'Day / week'],
            ['PageUp / PageDown', 'Same day, previous / next month'],
            ['Shift + PageUp / PageDown', 'Same day, previous / next year'],
            ['Home / End', 'Start / end of the week'],
            ['Enter / Space', 'Select'],
            ['Month title, then arrows', 'Month and year grids'],
            ['PageUp / PageDown in the grids', 'Previous / next year, or 12 years'],
            ['Escape', 'Back to the days'],
          ].map(([key, action]) => (
            <tr key={key}>
              <th>{key}</th>
              <td>{action}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
};

export const StringDates: Story = {
  name: 'String dates',
  args: {
    calendar: 'BS',
    defaultValue: '2026-10-15',
    minDate: '2026-10-05',
    maxDate: '2026-11-20',
    today: '2026-10-12',
  },
  render: (args) => <Calendar {...(args as object)} />,
};
