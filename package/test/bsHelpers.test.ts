import {
  addBsDays,
  addBsMonths,
  addBsYears,
  ad2Bs,
  bsDaysBetween,
  daysInBsMonth,
  formatBsDate,
  getBsToday,
  getBsWeekday,
} from '../utils';

describe('BS date helpers', () => {
  test('daysInBsMonth reads the BS table', () => {
    const months = Array.from({ length: 12 }, (_, i) => daysInBsMonth(2083, i + 1));
    expect(months).toEqual([31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30]);
    expect(() => daysInBsMonth(2100, 1)).toThrow(RangeError);
    expect(() => daysInBsMonth(2083, 13)).toThrow('BS month 13 is not between 1 and 12.');
  });

  test('getBsWeekday: 0 = Sunday', () => {
    expect(getBsWeekday('2083-07-12')).toBe(4);
    expect(getBsWeekday('२०८३-०६-२५')).toBe(0);
  });

  test('addBsDays crosses months and years, and refuses to leave the table', () => {
    expect(addBsDays('2083-07-12', 1)).toBe('2083-07-13');
    expect(addBsDays('2083-07-12', -12)).toBe('2083-06-31');
    expect(addBsDays('2083-01-01', 365)).toBe('2084-01-01');
    expect(() => addBsDays('2099-12-30', 5)).toThrow(/outside the supported range/);
  });

  test('addBsMonths and addBsYears clamp the day to the target month', () => {
    expect(addBsMonths('2083-03-32', 1)).toBe('2083-04-31');
    expect(addBsMonths('2083-01-15', -1)).toBe('2082-12-15');
    expect(addBsYears('2067-06-25', 16)).toBe('2083-06-25');
    expect(() => addBsMonths('2099-12-15', 1)).toThrow(RangeError);
  });

  test('bsDaysBetween counts whole days, negative backwards', () => {
    expect(bsDaysBetween('2083-01-01', '2084-01-01')).toBe(365);
    expect(bsDaysBetween('2083-07-12', '2083-07-01')).toBe(-11);
  });

  test('formatBsDate in Nepali by default, English on request', () => {
    expect(formatBsDate('2083-06-25')).toBe('२५ आश्विन २०८३');
    expect(formatBsDate('2083-06-25', { locale: 'en' })).toBe('25 Asoj 2083');
    expect(formatBsDate('२०८३-०६-२५', { weekday: true })).toBe('आइतवार, २५ आश्विन २०८३');
    expect(formatBsDate('2083-06-25', { locale: 'en', numerals: 'devanagari' })).toBe(
      '२५ Asoj २०८३',
    );
    expect(() => formatBsDate('2083-13-01')).toThrow(RangeError);
  });

  test('getBsToday follows the clock', () => {
    jest.useFakeTimers({ now: new Date(2026, 9, 29) });
    expect(getBsToday()).toBe('2083-07-12');
    expect(getBsToday()).toBe(ad2Bs(new Date()));
    jest.useRealTimers();
  });
});

describe('number arguments are checked (H1)', () => {
  test('non-numbers are a TypeError, naming the argument', () => {
    // @ts-expect-error a string where a number is expected
    expect(() => daysInBsMonth('2083', '1')).toThrow(
      new TypeError('Expected year to be a number, got string.'),
    );
    // @ts-expect-error a string where a number is expected
    expect(() => addBsDays('2083-07-12', '5')).toThrow(TypeError);
    expect(() => addBsMonths('2083-07-12', null)).toThrow(
      'Expected months to be a number, got null.',
    );
  });

  test('fractions and NaN are a RangeError instead of being truncated', () => {
    expect(() => addBsDays('2083-07-12', 1.5)).toThrow(
      new RangeError('Expected days to be a whole number, got 1.5.'),
    );
    expect(() => addBsYears('2083-07-12', NaN)).toThrow(RangeError);
    expect(() => daysInBsMonth(2083, 2.5)).toThrow('Expected month to be a whole number, got 2.5.');
  });

  test('whole numbers, including negative ones, still work', () => {
    expect(addBsDays('2083-07-12', -1)).toBe('2083-07-11');
    expect(addBsYears('2083-07-12', -1)).toBe('2082-07-12');
  });
});

test('formatBsDate rejects unknown locale and numerals options (L2)', () => {
  // @ts-expect-error an unsupported locale from plain JS
  expect(() => formatBsDate('2083-06-25', { locale: 'fr' })).toThrow(
    new RangeError("Expected locale to be 'en' or 'ne', got \"fr\"."),
  );
  // @ts-expect-error unsupported numerals from plain JS
  expect(() => formatBsDate('2083-06-25', { numerals: 'roman' })).toThrow(RangeError);
  expect(formatBsDate('2083-06-25', { locale: 'en', numerals: 'latin' })).toBe('25 Asoj 2083');
});
