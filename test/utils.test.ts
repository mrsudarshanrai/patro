import {
  dateString2Obj,
  ad2Bs,
  bs2Ad,
  getMonthFirstDay,
  en2NpNumber,
  formatDisplayDate,
  getToday,
} from '../utils';
import { getRawAdDates } from '../utils/ad_utils';
import { getRawBsDates } from '../utils/bs_utils';

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
  expect(() => ad2Bs('2043-04-15')).toThrow('AD Date out of range');
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
  expect(() => ad2Bs('1921-04-12')).toThrow('AD Date out of range');
  expect(ad2Bs('1921-04-13')).toBe('1978-01-01');
});

test('getMonthFirstDay returns the correct weekday regardless of local timezone', () => {
  // Hand-verified: Jan 1 2023 = Sunday, Feb 1 2024 = Thursday.
  expect(getMonthFirstDay(1, 2023)).toBe(0);
  expect(getMonthFirstDay(2, 2024)).toBe(4);
});

test('AD grid leading cells show the correct BS date across a January year boundary', () => {
  // Regression: the previous-month offset builder used to compute the
  // leading (previous-month spillover) cells' BS subscript from the wrong
  // month/year whenever the AD grid is January, since it mishandled rolling
  // back into December of the *previous* year.
  const grid = getRawAdDates(2024, 1, 1, { year: 2024, month: 1, date: 1 });
  const leadingCells = grid.flat().filter((cell) => cell.adDate < '2024-01-01');

  expect(leadingCells.length).toBeGreaterThan(0);
  leadingCells.forEach((cell) => {
    expect(cell.adDate.startsWith('2023-12')).toBe(true);
    expect(cell.extraDate).toBe(en2NpNumber(ad2Bs(cell.adDate).split('-')[2]));
  });
});

test('AD grid highlights the selected day, and only that day', () => {
  const selected = { year: 2024, month: 3, date: 15 };
  const grid = getRawAdDates(2024, 3, 15, selected).flat();

  expect(grid.find((cell) => cell.adDate === '2024-03-15')?.isSelected).toBe(true);
  expect(grid.find((cell) => cell.adDate === '2024-03-14')?.isSelected).toBe(false);
});

test('the same day in another year is not highlighted as selected', () => {
  const adSelected = { year: 2026, month: 10, date: 5 };
  const adGrid = getRawAdDates(2027, 10, 5, adSelected).flat();
  expect(adGrid.find((cell) => cell.adDate === '2027-10-05')?.isSelected).toBe(false);

  const bsSelected = { year: 2079, month: 7, date: 7 };
  const bsGrid = getRawBsDates('2080-07-07', 2023, 10, 24, adSelected, bsSelected).flat();
  expect(bsGrid.find((cell) => cell.adDate === bs2Ad('2080-07-07'))?.isSelected).toBe(false);
});

test('BS grid highlights the selected day, and only that day', () => {
  const adSelected = { year: 2022, month: 10, date: 24 };
  const bsSelected = { year: 2079, month: 7, date: 7 };
  const grid = getRawBsDates(bsDate, 2022, 10, 24, adSelected, bsSelected).flat();

  // BS 2079-07-07 is AD 2022-10-24 (the fixture at the top of this file).
  expect(grid.find((cell) => cell.adDate === '2022-10-24')?.isSelected).toBe(true);
  expect(grid.find((cell) => cell.adDate === '2022-10-23')?.isSelected).toBe(false);
});

test('formatDisplayDate formats a date in the given calendar system', () => {
  const date = new Date(2022, 9, 24); // October 24, 2022
  expect(formatDisplayDate(date, 'AD')).toBe('24 October 2022');
  expect(formatDisplayDate(date, 'BS')).toBe('०७ कार्तिक २०७९');
});
