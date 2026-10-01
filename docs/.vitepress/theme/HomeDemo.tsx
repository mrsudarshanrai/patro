import { useState } from 'react';
import { Calendar, Datepicker, type PatroDate, type PatroDateRange } from 'patro';

type Mode = 'single' | 'range';
type System = 'AD' | 'BS';

const Segmented = <T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: T[];
  value: T;
  onChange: (value: T) => void;
}) => (
  <div className='demo-segmented' role='group' aria-label={label}>
    {options.map((option) => (
      <button
        key={option}
        type='button'
        aria-pressed={option === value}
        onClick={() => onChange(option)}
      >
        {option}
      </button>
    ))}
  </div>
);

const show = (value: PatroDate | PatroDateRange | null) => {
  if (!value) return 'null';
  if ('ad' in value) return `{ ad: '${value.ad}', bs: '${value.bs}' }`;
  const end = (date: PatroDate | null) => (date ? `{ ad: '${date.ad}', bs: '${date.bs}' }` : 'null');
  return `{\n  start: ${end(value.start)},\n  end: ${end(value.end)}\n}`;
};

export const HomeDemo = ({ theme }: { theme: 'light' | 'dark' }) => {
  const [calendar, setCalendar] = useState<System>('BS');
  const [mode, setMode] = useState<Mode>('single');
  const [picked, setPicked] = useState<PatroDate | PatroDateRange | null>(null);
  // Remount on a mode switch: single and range values have different shapes.
  const key = `${mode}-${calendar}`;
  const common = { calendar, theme, onChange: setPicked, weekendDays: [6] };

  return (
    <div className='demo'>
      <div className='demo-controls'>
        <Segmented
          label='Calendar'
          options={['BS', 'AD'] as System[]}
          value={calendar}
          onChange={setCalendar}
        />
        <Segmented
          label='Mode'
          options={['single', 'range'] as Mode[]}
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
          <pre className='demo-output'>
            <span>onChange</span>
            {'\n'}
            {show(picked)}
          </pre>
        </div>
      </div>
    </div>
  );
};
