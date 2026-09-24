import { dateString2Obj, ad2Bs, bs2Ad, getMonthFirstDay } from '../utils';

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

test('getMonthFirstDay returns the correct weekday regardless of local timezone', () => {
  // Hand-verified: Jan 1 2023 = Sunday, Feb 1 2024 = Thursday.
  expect(getMonthFirstDay(1, 2023)).toBe(0);
  expect(getMonthFirstDay(2, 2024)).toBe(4);
});
