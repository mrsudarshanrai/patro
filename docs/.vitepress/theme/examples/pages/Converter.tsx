import { useState } from 'react';
import { ad2Bs, addBsDays, addBsMonths, addBsYears, bs2Ad, bsDaysBetween, formatBsDate, getBsToday, getBsWeekday, isValidAdDate, isValidBsDate } from 'patrojs';
import { Demo, Ledger, nf } from '../shared';

const weekdayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const attempt = <T,>(fn: () => T): T | string => {
  try {
    return fn();
  } catch (e) {
    return (e as Error).message;
  }
};

export default function Converter() {
  const [ad, setAd] = useState('2026-10-21');
  const [bs, setBs] = useState('२०८३-०७-२२');
  const [from, setFrom] = useState(getBsToday());
  const [to, setTo] = useState('2083-12-30');
  const [amount, setAmount] = useState(3);
  const [unit, setUnit] = useState<'days' | 'months' | 'years'>('months');

  const adOk = isValidAdDate(ad);
  const bsOk = isValidBsDate(bs);
  const adAsBs = adOk ? ad2Bs(ad) : null;
  const bsAsAd = bsOk ? bs2Ad(bs) : null;
  const between = isValidBsDate(from) && isValidBsDate(to) ? bsDaysBetween(from, to) : null;
  const shifted = isValidBsDate(from)
    ? attempt(() => (unit === 'days' ? addBsDays(from, amount) : unit === 'months' ? addBsMonths(from, amount) : addBsYears(from, amount)))
    : null;

  return (
    <Demo>
      <div className='tools'>
        <section className='tool' aria-labelledby='ad-bs'>
          <h2 id='ad-bs'>AD → BS</h2>
          <label htmlFor='ad-input'>AD date (YYYY-MM-DD)</label>
          <input id='ad-input' className='mono' value={ad} onChange={(e) => setAd(e.target.value)} aria-invalid={!adOk} inputMode='numeric' />
          <output htmlFor='ad-input' className={adOk ? 'result' : 'result bad'}>
            {adAsBs ? (
              <>
                <span className='big'>{formatBsDate(adAsBs, { weekday: true })}</span>
                <span className='mono'>{adAsBs}</span>
              </>
            ) : (
              'Not a supported AD date. Use YYYY-MM-DD between 1921-04-13 and 2043-04-14.'
            )}
          </output>
        </section>
        <section className='tool' aria-labelledby='bs-ad'>
          <h2 id='bs-ad'>BS → AD</h2>
          <label htmlFor='bs-input'>BS date (YYYY-MM-DD, Latin or Devanagari digits)</label>
          <input id='bs-input' className='mono' value={bs} onChange={(e) => setBs(e.target.value)} aria-invalid={!bsOk} />
          <output htmlFor='bs-input' className={bsOk ? 'result' : 'result bad'}>
            {bsAsAd ? (
              <>
                <span className='big'>
                  {weekdayEn[new Date(bsAsAd + 'T00:00:00Z').getUTCDay()]}, {new Date(bsAsAd + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}
                </span>
                <span className='mono'>{bsAsAd}</span>
              </>
            ) : (
              'Not a valid BS date. Months have 29 to 32 days, and years run from 1978 to 2099.'
            )}
          </output>
        </section>
        <section className='tool wide' aria-labelledby='math'>
          <h2 id='math'>BS date arithmetic</h2>
          <div className='row'>
            <div className='field'>
              <label htmlFor='from'>From (BS)</label>
              <input id='from' className='mono' value={from} onChange={(e) => setFrom(e.target.value)} aria-invalid={!isValidBsDate(from)} />
            </div>
            <div className='field'>
              <label htmlFor='to'>To (BS)</label>
              <input id='to' className='mono' value={to} onChange={(e) => setTo(e.target.value)} aria-invalid={!isValidBsDate(to)} />
            </div>
            <div className='field'>
              <label htmlFor='amount'>Add</label>
              <div className='inline'>
                <input id='amount' type='number' className='mono' value={amount} onChange={(e) => setAmount(Math.trunc(Number(e.target.value)))} />
                <select aria-label='Unit' value={unit} onChange={(e) => setUnit(e.target.value as typeof unit)}>
                  <option value='days'>days</option>
                  <option value='months'>months</option>
                  <option value='years'>years</option>
                </select>
              </div>
            </div>
          </div>
          <Ledger
            title='Results'
            entries={[
              ['Days from → to', between === null ? 'Enter two valid BS dates.' : `${nf.format(between)} days`],
              [`From + ${amount} ${unit}`, typeof shifted === 'string' && isValidBsDate(shifted) ? <span>{formatBsDate(shifted, { locale: 'en', weekday: true })} · <code>{shifted}</code></span> : shifted ?? 'Enter a valid BS date.'],
              ['Weekday of from', isValidBsDate(from) ? weekdayEn[getBsWeekday(from)] : '–'],
            ]}
          />
        </section>
      </div>
    </Demo>
  );
}
