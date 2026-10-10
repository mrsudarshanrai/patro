import { useState } from 'react';
import { Calendar, Datepicker, type PatroDate, type PatroDateRange } from 'patrojs';

type Theme = { theme: 'light' | 'dark' };
type Mode = 'single' | 'range';
type System = 'AD' | 'BS';

// A few public holidays in BS 2083 (AD 2026–27), keyed by BS date.
const HOLIDAYS: Record<string, string> = {
  '2083-06-25': 'Ghatasthapana',
  '2083-07-04': 'Vijaya Dashami',
  '2083-07-22': 'Laxmi Puja',
  '2083-07-24': 'Govardhan Puja',
  '2083-07-25': 'Bhai Tika',
  '2083-07-29': 'Chhath',
};

const holidayDot = ({ bs }: PatroDate) => HOLIDAYS[bs] && <i className='demo-dot' />;
const holidayLabel = ({ bs }: PatroDate) => HOLIDAYS[bs];

export const HeroCalendar = ({ theme }: Theme) => (
  <Calendar
    calendar='BS'
    theme={theme}
    defaultValue={new Date()}
    weekendDays={[6]}
    dayContent={holidayDot}
    dayLabel={holidayLabel}
    showTodayButton
  />
);

const Segmented = <T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; text: string }[];
  value: T;
  onChange: (value: T) => void;
}) => (
  <div className='demo-segmented' role='group' aria-label={label}>
    {options.map((option) => (
      <button
        key={option.value}
        type='button'
        aria-pressed={option.value === value}
        onClick={() => onChange(option.value)}
      >
        {option.text}
      </button>
    ))}
  </div>
);

const describe = (date: PatroDate | null) =>
  date ? `{ ad: '${date.ad}', bs: '${date.bs}' }` : 'null';

const show = (value: PatroDate | PatroDateRange | null) => {
  if (!value) return 'null';
  if ('ad' in value) return describe(value);
  return `{\n  start: ${describe(value.start)},\n  end:   ${describe(value.end)}\n}`;
};

export const Playground = ({ theme }: Theme) => {
  const [calendar, setCalendar] = useState<System>('BS');
  const [mode, setMode] = useState<Mode>('single');
  const [picked, setPicked] = useState<PatroDate | PatroDateRange | null>(null);
  // Remount on a switch: single and range values have different shapes.
  const key = `${mode}-${calendar}`;
  const common = {
    calendar,
    theme,
    onChange: setPicked,
    weekendDays: [6],
    dayContent: holidayDot,
    dayLabel: holidayLabel,
  };

  return (
    <div className='demo'>
      <div className='demo-toolbar'>
        <Segmented
          label='Calendar'
          options={[
            { value: 'BS' as System, text: 'BS · बि.सं.' },
            { value: 'AD' as System, text: 'AD' },
          ]}
          value={calendar}
          onChange={setCalendar}
        />
        <Segmented
          label='Mode'
          options={[
            { value: 'single' as Mode, text: 'Single date' },
            { value: 'range' as Mode, text: 'Range' },
          ]}
          value={mode}
          onChange={(next) => {
            setMode(next);
            setPicked(null);
          }}
        />
      </div>
      <div className='demo-stage'>
        {mode === 'range' ? (
          <Calendar key={key} {...common} mode='range' />
        ) : (
          <Calendar key={key} {...common} />
        )}
        <div className='demo-side'>
          {mode === 'range' ? (
            <Datepicker key={key} {...common} mode='range' label='Datepicker' clearable />
          ) : (
            <Datepicker key={key} {...common} label='Datepicker' editable clearable />
          )}
          <div className='demo-output'>
            <div className='demo-output-bar'>
              <span />
              <span />
              <span />
              <em>onChange</em>
            </div>
            <pre>{show(picked)}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
