import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  addBsDays,
  addBsMonths,
  addBsYears,
  bsDaysBetween,
  daysInBsMonth,
  formatBsDate,
  getBsToday,
  getBsWeekday,
} from '../index';
import { Readout } from './helpers';

const meta = {
  title: 'Utilities/BS date helpers',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const attempt = (run: () => string | number) => {
  try {
    return String(run());
  } catch (error) {
    return `⚠ ${(error as Error).message}`;
  }
};

const NumberField = ({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
}) => (
  <div className='story-field'>
    <label htmlFor={id}>{label}</label>
    <input
      id={id}
      type='number'
      value={value}
      onChange={(event) => onChange(event.target.valueAsNumber)}
    />
  </div>
);

const HelpersDemo = () => {
  const today = getBsToday();
  const [date, setDate] = useState(today);
  const [days, setDays] = useState(10);
  const [months, setMonths] = useState(1);
  const [years, setYears] = useState(16);
  const latin = attempt(() => addBsDays(date, 0));
  const [year, month] = (latin.startsWith('⚠') ? date : latin).split('-').map(Number);

  return (
    <div className='story-form'>
      <h2>BS date helpers</h2>
      <p>
        Type a BS date (Latin or Devanagari digits). Invalid input shows the error the helper
        throws. All of these are exported from <code>patrojs</code> and <code>patrojs/utils</code>.
      </p>

      <div className='story-field'>
        <label htmlFor='bs-date'>BS date</label>
        <input id='bs-date' value={date} onChange={(event) => setDate(event.target.value)} />
      </div>
      <Readout label='getBsToday()'>{today}</Readout>
      <Readout label={`getBsWeekday('${date}')`}>
        {attempt(() => {
          const weekday = getBsWeekday(date);
          return `${weekday} (${WEEKDAYS[weekday]})`;
        })}
      </Readout>
      <Readout label={`daysInBsMonth(${year}, ${month})`}>
        {attempt(() => daysInBsMonth(year, month))}
      </Readout>

      <NumberField id='days' label='Days' value={days} onChange={setDays} />
      <Readout label={`addBsDays('${date}', ${days})`}>
        {attempt(() => addBsDays(date, days))}
      </Readout>
      <NumberField id='months' label='Months' value={months} onChange={setMonths} />
      <Readout label={`addBsMonths('${date}', ${months})`}>
        {attempt(() => addBsMonths(date, months))}
      </Readout>
      <NumberField id='years' label='Years' value={years} onChange={setYears} />
      <Readout label={`addBsYears('${date}', ${years})`}>
        {attempt(() => addBsYears(date, years))}
      </Readout>
      <Readout label={`bsDaysBetween('${today}', '${date}')`}>
        {attempt(() => bsDaysBetween(today, date))}
      </Readout>

      <Readout label={`formatBsDate('${date}')`}>{attempt(() => formatBsDate(date))}</Readout>
      <Readout label={`formatBsDate('${date}', { weekday: true })`}>
        {attempt(() => formatBsDate(date, { weekday: true }))}
      </Readout>
      <Readout label={`formatBsDate('${date}', { locale: 'en', weekday: true })`}>
        {attempt(() => formatBsDate(date, { locale: 'en', weekday: true }))}
      </Readout>
    </div>
  );
};

export const BsDateHelpers: Story = {
  name: 'BS date helpers',
  render: () => <HelpersDemo />,
};
