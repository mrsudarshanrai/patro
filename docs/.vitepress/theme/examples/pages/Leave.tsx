import { useState, type CSSProperties } from 'react';
import { Datepicker, addBsDays, bsDaysBetween, formatBsDate, getBsWeekday, type PatroDateRange } from 'patrojs';
import { holidays, isPublicHoliday } from '../data/holidays';
import { Demo, Ledger } from '../shared';

const BALANCE = 12; // days of annual leave left
const toNe = (n: number) => String(n).replace(/\d/g, (d) => '०१२३४५६७८९'[Number(d)]);

/** Days in the range that cost leave: not Saturday, not a public holiday. */
function countLeave(startBs: string, endBs: string) {
  let working = 0;
  const skipped: string[] = [];
  for (let d = startBs, i = 0; i <= bsDaysBetween(startBs, endBs); i++, d = addBsDays(startBs, i)) {
    if (getBsWeekday(d) === 6) skipped.push(`${formatBsDate(d)} (शनिबार)`);
    else if (isPublicHoliday(d)) skipped.push(`${formatBsDate(d)} (${holidays[d].ne})`);
    else working++;
  }
  return { working, skipped };
}

export default function Leave({ theme }: { theme: 'light' | 'dark' }) {
  const [range, setRange] = useState<PatroDateRange>({ start: null, end: null });
  const [sent, setSent] = useState<[string, string][] | null>(null);
  const count = range.start && range.end ? countLeave(range.start.bs, range.end.bs) : null;
  const over = !!count && count.working > BALANCE;

  return (
    <Demo
      aside={
        <>
          <Ledger
            title='बिदाको हिसाब'
            empty='बिदा सुरु र अन्त्य मिति छान्नुहोस्।'
            entries={
              count
                ? [
                    ['जम्मा दिन', toNe(bsDaysBetween(range.start!.bs, range.end!.bs) + 1)],
                    ['बिदा लाग्ने दिन', <strong className={over ? 'tag-holiday' : undefined}>{toNe(count.working)}</strong>],
                    ['बाँकी बिदा', toNe(Math.max(0, BALANCE - count.working))],
                    ['नगनिएका दिन', count.skipped.length ? <ul className='plain'>{count.skipped.map((s) => <li key={s}>{s}</li>)}</ul> : '–'],
                  ]
                : []
            }
          />
          <Ledger title='पठाइएको फारम' empty='निवेदन पेश गरेपछि यहाँ देखिन्छ।' entries={(sent ?? []).map(([k, v]) => [k, <code>{v || '–'}</code>])} />
        </>
      }
    >
      <form
        lang='ne'
        className='form'
        onSubmit={(e) => {
          e.preventDefault();
          setSent([...new FormData(e.currentTarget).entries()].map(([k, v]) => [k, String(v)]));
        }}
      >
        <div className='field'>
          <label htmlFor='leave-type'>बिदाको प्रकार</label>
          <select id='leave-type' name='type' defaultValue='घर बिदा'>
            <option>घर बिदा</option>
            <option>बिरामी बिदा</option>
            <option>पर्व बिदा</option>
          </select>
        </div>
        <div className='field'>
          <Datepicker
            id='leave-dates'
            label='बिदाको अवधि'
            mode='range'
            calendar='BS'
            locale='ne'
            numerals='devanagari'
            theme={theme}
            name='leave'
            valueFormat='bs'
            weekendDays={[6]}
            defaultMonth='2026-10-21'
            dayClassName={({ bs }) => (isPublicHoliday(bs) ? 'is-holiday' : undefined)}
            dayLabel={({ bs }) => holidays[bs]?.ne}
            onChange={setRange}
            required
            clearable
            style={{ '--patro-input-width': '100%' } as CSSProperties}
          />
          {over && <p className='error' role='alert'>तपाईंसँग {toNe(BALANCE)} दिन मात्र बिदा बाँकी छ।</p>}
        </div>
        <div className='field'>
          <label htmlFor='reason'>कारण</label>
          <textarea id='reason' name='reason' rows={3} defaultValue='दशैं मनाउन घर जानुपर्ने भएकोले।' />
        </div>
        <div className='actions'>
          <button type='submit' className='primary' disabled={over}>
            निवेदन पेश गर्नुहोस्
          </button>
        </div>
      </form>
    </Demo>
  );
}
