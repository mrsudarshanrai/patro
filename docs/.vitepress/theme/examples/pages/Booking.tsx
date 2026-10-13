import { useState, type CSSProperties } from 'react';
import { Datepicker, bsDaysBetween, formatBsDate, type DateRange, type PatroDateRange } from 'patrojs';
import { Demo, Ledger, nf } from '../shared';

const RATE = 4800; // NPR per night
// Nights already taken in the sample inventory, keyed by AD date (the night starting that day).
const booked = new Set(['2026-10-24', '2026-10-25', '2026-11-07', '2026-11-08', '2026-11-09', '2026-11-20']);

export default function Booking({ theme }: { theme: 'light' | 'dark' }) {
  const [range, setRange] = useState<PatroDateRange>({ start: null, end: null });
  const [sent, setSent] = useState<[string, string][] | null>(null);
  const nights = range.start && range.end ? bsDaysBetween(range.start.bs, range.end.bs) : 0;
  const value: DateRange = { start: range.start?.date ?? null, end: range.end?.date ?? null };

  return (
    <Demo
      aside={
        <>
          <Ledger
            title='Your stay'
            empty='Pick a check-in day, then a check-out day.'
            entries={
              range.start
                ? [
                    ['Check-in', formatBsDate(range.start.bs, { locale: 'en', weekday: true }) + ` · ${range.start.ad}`],
                    ['Check-out', range.end ? formatBsDate(range.end.bs, { locale: 'en', weekday: true }) + ` · ${range.end.ad}` : 'Pick a day'],
                    ['Nights', nights ? String(nights) : '–'],
                    ['Total', nights ? `NPR ${nf.format(nights * RATE)}` : '–'],
                  ]
                : []
            }
          />
          <Ledger
            title='Form data sent'
            empty='Book to see the fields a plain form post carries.'
            entries={(sent ?? []).map(([k, v]) => [k, <code>{v || '(empty)'}</code>])}
          />
        </>
      }
    >
      <form
        className='form'
        onSubmit={(e) => {
          e.preventDefault();
          setSent([...new FormData(e.currentTarget).entries()].map(([k, v]) => [k, String(v)]));
        }}
      >
        <div className='room'>
          <div>
            <p className='room-name'>Deluxe room, lake view</p>
            <p className='help'>Pokhara · NPR {nf.format(RATE)} a night · free cancellation until 3 days before</p>
          </div>
          <p className='room-rate'>
            <span className='num'>{nf.format(RATE)}</span>
            <span className='unit'>NPR / night</span>
          </p>
        </div>
        <div className='field'>
          <Datepicker
            id='stay'
            label='Check-in – check-out'
            mode='range'
            name='stay'
            theme={theme}
            numberOfMonths={2}
            minDays={3}
            maxDays={15}
            minDate={new Date()}
            defaultMonth='2026-10-15'
            isDateDisabled={({ ad }) => booked.has(ad)}
            excludeDisabled
            dayClassName={({ ad }) => (booked.has(ad) ? 'is-booked' : undefined)}
            dayLabel={({ ad }) => (booked.has(ad) ? 'Booked' : undefined)}
            presets={[
              { label: 'This weekend', value: () => nextWeekend() },
              { label: 'Dashain week', value: { start: '2026-10-18', end: '2026-10-23' } },
            ]}
            value={value}
            onChange={setRange}
            required
            clearable
            style={{ '--patro-input-width': '100%' } as CSSProperties}
          />
          <p className='help'>
            Struck-through days are booked. A stay ends on the morning of its check-out day, so {nights ? `${nights} nights` : 'the nights'} are counted between
            the two.
          </p>
        </div>
        <div className='actions'>
          <button type='submit' className='primary' disabled={!nights}>
            {nights ? `Book ${nights} nights · NPR ${nf.format(nights * RATE)}` : 'Book'}
          </button>
        </div>
      </form>
    </Demo>
  );
}

/** Friday to Sunday of the coming weekend, as AD strings. */
function nextWeekend() {
  const d = new Date();
  const toFriday = (5 - d.getDay() + 7) % 7 || 7;
  const friday = new Date(d.getFullYear(), d.getMonth(), d.getDate() + toFriday);
  const sunday = new Date(friday.getFullYear(), friday.getMonth(), friday.getDate() + 2);
  return { start: friday, end: sunday };
}

