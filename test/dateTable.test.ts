import { ad2Bs, bs2Ad, createDateString } from '../utils';
import { dates, MIN_BS_YEAR, MAX_BS_YEAR, START_ENGLISH_DATE, MAX_AD_DATE } from '../constants/dateConstants';

// Verified against independent real-world sources, not derived from the table.
const checkpoints: [bs: string, ad: string, source: string][] = [
  ['1978-01-01', '1921-04-13', 'table anchor'],
  ['2083-01-01', '2026-04-14', 'Nepali New Year 2083'],
  ['2083-03-01', '2026-06-15', 'Ashadh 2083 start'],
  ['2083-06-01', '2026-09-17', 'Ashwin 2083 start'],
  ['2083-07-01', '2026-10-18', 'Kartik 2083 start'],
  ['2083-07-04', '2026-10-21', 'Vijaya Dashami 2083'],
  ['2083-07-12', '2026-10-29', 'nepalipatro.com'],
  ['2083-10-01', '2027-01-15', 'Maghe Sankranti 2083'],
  ['2083-12-30', '2027-04-13', 'last day of BS 2083'],
  ['2093-07-12', '2036-10-29', 'nepalipatro.com'],
];

test.each(checkpoints)('BS %s is AD %s (%s)', (bs, ad) => {
  expect(bs2Ad(bs)).toBe(ad);
  expect(ad2Bs(ad)).toBe(bs);
});

test('every year has 12 months of 29-32 days totalling 365 or 366', () => {
  for (let year = MIN_BS_YEAR; year <= MAX_BS_YEAR; year++) {
    const [tableYear, ...months] = dates[year];
    expect(tableYear).toBe(year);
    expect(months).toHaveLength(12);
    months.forEach((days) => expect(days >= 29 && days <= 32).toBe(true));
    expect([365, 366]).toContain(months.reduce((sum, days) => sum + days, 0));
  }
});

test('every supported AD day round-trips and maps to the next BS day', () => {
  const day = new Date(`${START_ENGLISH_DATE}T00:00:00Z`);
  let previousBs: string | undefined;

  while (true) {
    const ad = createDateString(day.getUTCFullYear(), day.getUTCMonth() + 1, day.getUTCDate());
    const bs = ad2Bs(ad);
    expect(bs2Ad(bs)).toBe(ad);
    if (previousBs) expect(bs > previousBs).toBe(true);
    previousBs = bs;
    if (ad === MAX_AD_DATE) break;
    day.setUTCDate(day.getUTCDate() + 1);
  }
});
