import { useState } from 'react';
import { Calendar, ad2Bs, daysInBsMonth, formatBsDate, type PatroDate } from 'patrojs';
import { holidays } from '../data/holidays';
import { Demo, Ledger } from '../shared';

type View = 'bs-ne' | 'bs-en' | 'ad-en';
const views: { id: View; label: string }[] = [
  { id: 'bs-ne', label: 'वि.सं. नेपाली' },
  { id: 'bs-en', label: 'BS English' },
  { id: 'ad-en', label: 'AD English' },
];

// The month the calendar opens on (Kartik 2083 / October 2026), as BS bounds.
const openingMonth = (view: View) =>
  view === 'ad-en'
    ? { start: ad2Bs('2026-10-01'), end: ad2Bs('2026-10-31') }
    : { start: '2083-07-01', end: `2083-07-${daysInBsMonth(2083, 7)}` };

export default function Today({ theme }: { theme: 'light' | 'dark' }) {
  const [view, setView] = useState<View>('bs-ne');
  const [month, setMonth] = useState(() => openingMonth('bs-ne'));
  const [picked, setPicked] = useState<PatroDate | null>(null);
  const english = view !== 'bs-ne';

  const inMonth = Object.entries(holidays).filter(([bs]) => bs >= month.start && bs <= month.end);

  return (
    <Demo
      aside={
        <>
          <Ledger
            title={english ? 'Festivals this month' : 'यो महिनाका पर्व'}
            empty={english ? 'No listed festivals in this month.' : 'यो महिनामा सूचीकृत पर्व छैन।'}
            entries={inMonth.map(([bs, h]) => [
              formatBsDate(bs, { locale: english ? 'en' : 'ne' }),
              <span className={h.publicHoliday ? 'tag-holiday' : undefined}>{english ? h.en : h.ne}</span>,
            ])}
          />
          <Ledger
            title='onChange payload'
            empty='Pick a day to see what onChange receives.'
            entries={
              picked
                ? [
                    ['ad', <code>{picked.ad}</code>],
                    ['bs', <code>{picked.bs}</code>],
                    ['date', <code>{picked.date.toDateString()}</code>],
                    ['formatBsDate', formatBsDate(picked.bs, { weekday: true })],
                  ]
                : []
            }
          />
        </>
      }
    >
      <div className='segmented' role='radiogroup' aria-label='Calendar and language'>
        {views.map((v) => (
          <button key={v.id} type='button' role='radio' aria-checked={view === v.id} onClick={() => { setView(v.id); setMonth(openingMonth(v.id)); }}>
            {v.label}
          </button>
        ))}
      </div>
      <Calendar
        key={view}
        className='showcase-calendar'
        theme={theme}
        calendar={view === 'ad-en' ? 'AD' : 'BS'}
        locale={english ? 'en' : 'ne'}
        numerals={english ? 'latin' : 'devanagari'}
        weekendDays={[6]}
        showTodayButton
        defaultMonth='2026-10-21'
        dayClassName={({ bs }) => (holidays[bs]?.publicHoliday ? 'is-holiday' : undefined)}
        dayContent={({ bs }) => (holidays[bs] ? <i className='festival-dot' aria-hidden='true' /> : null)}
        dayLabel={({ bs }) => (english ? holidays[bs]?.en : holidays[bs]?.ne)}
        onMonthChange={({ start, end }) => setMonth({ start: start.bs, end: end.bs })}
        onChange={setPicked}
      />
      <p className='hint'>Opens on Kartik 2083, the month of Dashain and Tihar. Use the arrows, PageUp/PageDown, or the month title to move.</p>
    </Demo>
  );
}
