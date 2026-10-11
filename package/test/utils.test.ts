import {
  dateString2Obj,
  ad2Bs,
  bs2Ad,
  getMonthFirstDay,
  en2NpNumber,
  formatDate,
  monthRange,
  monthTitle,
  getToday,
  getMonthGrid,
  isValidAdDate,
  isValidBsDate,
  parseInputDate,
  formatInputDate,
} from '../utils';

const adDate = '2022-10-24';
const bsDate = '2079-07-07';

test('Date string to Obj', () => {
  expect(dateString2Obj(adDate)).toEqual({
    year: 2022,
    month: 10,
    day: 24,
  });
});

test('Convert AD date to BS', () => {
  expect(ad2Bs(adDate)).toBe(bsDate);
});

test('Convert BS date to AD', () => {
  expect(bs2Ad(bsDate)).toBe(adDate);
});

test('AD date past the BS table range throws', () => {
  // 2043-04-14 (BS 2099-12-31) is the last date the table supports.
  expect(() => ad2Bs('2043-04-15')).toThrow('outside the supported range');
  expect(ad2Bs('2043-04-14')).toBe('2099-12-31');
});

test('getToday reads the clock at call time, not at import time', () => {
  jest.useFakeTimers().setSystemTime(new Date(2026, 8, 30, 23, 59));
  expect(getToday()).toEqual({ year: 2026, month: 9, date: 30 });
  jest.setSystemTime(new Date(2026, 9, 1, 0, 1));
  expect(getToday()).toEqual({ year: 2026, month: 10, date: 1 });
  jest.useRealTimers();
});

test('impossible AD dates throw instead of rolling over', () => {
  expect(() => ad2Bs('2026-02-30')).toThrow();
  expect(() => ad2Bs('2026-02-29')).toThrow();
  expect(() => ad2Bs('2026-04-31')).toThrow();
  expect(() => ad2Bs('2026-10-00')).toThrow();
  expect(ad2Bs('2024-02-29')).toBe('2080-11-17');
});

test('AD date before the BS table range throws', () => {
  expect(() => ad2Bs('1921-04-12')).toThrow('outside the supported range');
  expect(ad2Bs('1921-04-13')).toBe('1978-01-01');
});

test('conversions accept only YYYY-MM-DD, in Latin or Devanagari digits', () => {
  expect(() => ad2Bs('2022-1-5')).toThrow(/expected 'YYYY-MM-DD'/);
  expect(() => ad2Bs(' 2022-10-24')).toThrow(/expected 'YYYY-MM-DD'/);
  expect(() => ad2Bs('2022/10/24')).toThrow(/expected 'YYYY-MM-DD'/);
  expect(() => ad2Bs('')).toThrow(RangeError);
  expect(() => ad2Bs(undefined as unknown as string)).toThrow(TypeError);
  expect(() => bs2Ad(null as unknown as string)).toThrow('got null');
  expect(bs2Ad('२०७९-०७-०७')).toBe(adDate);
});

test('ad2Bs takes a Date, read in local time', () => {
  expect(ad2Bs(new Date(2022, 9, 24, 23, 30))).toBe(bsDate);
});

test('impossible BS dates and months throw', () => {
  expect(() => bs2Ad('2080-01-32')).toThrow('not a valid BS date');
  expect(() => bs2Ad('2080-13-01')).toThrow(RangeError);
  expect(() => bs2Ad('1977-12-30')).toThrow(
    'outside the supported range (1978-01-01 to 2099-12-31)',
  );
});

test('isValidAdDate / isValidBsDate never throw', () => {
  expect(isValidAdDate('2024-02-29')).toBe(true);
  expect(isValidAdDate('2026-02-29')).toBe(false);
  expect(isValidAdDate('2043-04-15')).toBe(false);
  expect(isValidAdDate(42 as unknown as string)).toBe(false);
  expect(isValidBsDate('२०८०-०१-३१')).toBe(true);
  expect(isValidBsDate('2080-01-32')).toBe(false);
});

test('getMonthFirstDay returns the correct weekday regardless of local timezone', () => {
  // Hand-verified: Jan 1 2023 = Sunday, Feb 1 2024 = Thursday.
  expect(getMonthFirstDay(1, 2023)).toBe(0);
  expect(getMonthFirstDay(2, 2024)).toBe(4);
});

test('AD grid leading cells show the correct BS date across a January year boundary', () => {
  const grid = getMonthGrid('AD', '2024-01-01', '2024-01-01');
  const leadingCells = grid.flat().filter((cell) => cell.adDate < '2024-01-01');

  expect(leadingCells.length).toBeGreaterThan(0);
  leadingCells.forEach((cell) => {
    expect(cell.adDate.startsWith('2023-12')).toBe(true);
    expect(cell.secondaryDay).toBe(Number(ad2Bs(cell.adDate).split('-')[2]));
  });
});

test('AD grid highlights the selected day, and only that day', () => {
  const grid = getMonthGrid('AD', '2024-03-01', '2024-03-15').flat();

  expect(grid.find((cell) => cell.adDate === '2024-03-15')?.isSelected).toBe(true);
  expect(grid.find((cell) => cell.adDate === '2024-03-14')?.isSelected).toBe(false);
});

test('the same day in another year is not highlighted as selected', () => {
  const adGrid = getMonthGrid('AD', '2027-10-01', '2026-10-05').flat();
  expect(adGrid.find((cell) => cell.adDate === '2027-10-05')?.isSelected).toBe(false);

  const bsGrid = getMonthGrid('BS', bs2Ad('2080-07-01'), bs2Ad(bsDate)).flat();
  expect(bsGrid.find((cell) => cell.adDate === bs2Ad('2080-07-07'))?.isSelected).toBe(false);
});

test('BS grid highlights the selected day, and only that day', () => {
  const grid = getMonthGrid('BS', bs2Ad('2079-07-01'), adDate).flat();

  expect(grid.find((cell) => cell.adDate === '2022-10-24')?.isSelected).toBe(true);
  expect(grid.find((cell) => cell.adDate === '2022-10-23')?.isSelected).toBe(false);
});

test('formatDate writes a date in either calendar, language and numerals', () => {
  expect(formatDate('2022-10-24', 'AD')).toBe('24 October 2022');
  expect(formatDate('2022-10-24', 'BS')).toBe('७ कार्तिक २०७९');
  expect(formatDate('2022-10-24', 'BS', { locale: 'en', numerals: 'latin' })).toBe('7 Kartik 2079');
  expect(formatDate('2022-10-24', 'AD', { locale: 'ne', numerals: 'devanagari' })).toBe(
    '२४ अक्टोबर २०२२',
  );
  expect(formatDate('2022-10-24', 'AD', {}, { short: true })).toBe('24 Oct 2022');
  expect(formatDate('2022-10-24', 'BS', {}, { withYear: false })).toBe('७ कार्तिक');
});

test('month titles and ranges name both years when a month spans two', () => {
  expect(monthTitle('2026-12-16', 'BS')).toBe('पौष २०८३');
  expect(monthRange('2026-12-16', '2027-01-14', 'BS')).toBe('Dec 2026 – Jan 2027');
  expect(monthRange('2026-04-01', '2026-04-30', 'AD')).toBe('चैत्र २०८२ – बैशाख २०८३');
});

test('en2NpNumber converts only digits', () => {
  expect(en2NpNumber('2083-07 12')).toBe('२०८३-०७ १२');
});

describe('typed dates', () => {
  test('parseInputDate reads the displayed calendar, with loose separators and digits', () => {
    expect(parseInputDate('2026-10-29', 'AD')).toBe('2026-10-29');
    expect(parseInputDate(' 2026/1/5 ', 'AD')).toBe('2026-01-05');
    expect(parseInputDate('2026.10.29', 'AD')).toBe('2026-10-29');
    expect(parseInputDate('२०८३-०७-१२', 'BS')).toBe('2026-10-29');
    expect(parseInputDate('2083 7 12', 'BS')).toBe('2026-10-29');
  });

  test('parseInputDate rejects partial, impossible and unsupported dates', () => {
    for (const text of [
      '',
      '2026-10',
      '26-10-29',
      '2026-10-029',
      '2026-02-30',
      '2050-01-01',
      'abc',
    ]) {
      expect(parseInputDate(text, 'AD')).toBeNull();
    }
    expect(parseInputDate('2083-07-33', 'BS')).toBeNull();
  });

  test('formatInputDate writes the displayed calendar in its digits', () => {
    expect(formatInputDate('2026-10-29', 'AD')).toBe('2026-10-29');
    expect(formatInputDate('2026-10-29', 'BS')).toBe('२०८३-०७-१२');
    expect(formatInputDate('2026-10-29', 'BS', { numerals: 'latin' })).toBe('2083-07-12');
  });
});

test('isValidAdDate accepts a Date like ad2Bs does', () => {
  expect(isValidAdDate(new Date(2026, 9, 15))).toBe(true);
  expect(isValidAdDate(new Date(1900, 0, 1))).toBe(false);
  expect(isValidAdDate(new Date(NaN))).toBe(false);
  expect(() => ad2Bs(new Date(NaN))).toThrow('Invalid Date.');
});
