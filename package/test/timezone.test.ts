import { ad2Bs, addBsDays, bs2Ad, adDateToLocalDate, getBsWeekday } from '../utils';

// Runs under whatever TZ the process started with; `npm run test:tz` runs this
// file once per timezone, since jest sandboxes process.env per test file.
describe(`in ${Intl.DateTimeFormat().resolvedOptions().timeZone}`, () => {
  test('bs2Ad is timezone-independent', () => {
    expect(bs2Ad('1978-01-01')).toBe('1921-04-13');
    expect(bs2Ad('2083-07-12')).toBe('2026-10-29');
    expect(bs2Ad('2093-07-12')).toBe('2036-10-29');
  });

  test('ad2Bs is timezone-independent', () => {
    expect(ad2Bs('1921-04-13')).toBe('1978-01-01');
    expect(ad2Bs('2026-10-29')).toBe('2083-07-12');
  });

  test('month lengths ignore days a timezone skipped', () => {
    expect(ad2Bs('1994-12-15')).toBe('2051-08-29');
    expect(ad2Bs('1994-12-31')).toBe('2051-09-16');
    expect(bs2Ad(ad2Bs('1994-12-31'))).toBe('1994-12-31');
  });

  test('BS helpers are timezone-independent', () => {
    expect(addBsDays('2083-01-01', 365)).toBe('2084-01-01');
    expect(getBsWeekday('2083-07-12')).toBe(4);
  });

  test('adDateToLocalDate keeps the same calendar day locally', () => {
    const date = adDateToLocalDate('2026-10-29');
    expect([date.getFullYear(), date.getMonth() + 1, date.getDate()]).toEqual([2026, 10, 29]);
  });
});
