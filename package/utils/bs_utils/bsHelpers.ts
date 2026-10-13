import { MAX_BS_YEAR, MIN_BS_YEAR, dates } from '../../constants/dateConstants';
import { ad2Bs } from '../ad_utils/ad2bs';
import { createDateString, dateString2Obj, isSupportedAdDate } from '../dateUtils';
import { formatDate, weekdayNames } from '../formatUtils';
import type { FormatBsDateOptions } from '../../types/public';
import { MAX_BS_DATE, MIN_BS_DATE, bs2Ad, validateBsDate } from './bs2ad';

const DAY_MS = 86_400_000;

const adToUtcMs = (adDate: string) => {
  const { year, month, day } = dateString2Obj(adDate);
  return Date.UTC(year, month - 1, day);
};

const utcMsToAd = (ms: number) => {
  const date = new Date(ms);
  return createDateString(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
};

const wholeNumber = (value: unknown, name: string) => {
  if (typeof value !== 'number') {
    throw new TypeError(
      `Expected ${name} to be a number, got ${value === null ? 'null' : typeof value}.`,
    );
  }
  if (!Number.isInteger(value))
    throw new RangeError(`Expected ${name} to be a whole number, got ${value}.`);
  return value;
};

const oneOf = (value: unknown, name: string, allowed: string[]) => {
  if (!allowed.includes(value as string)) {
    throw new RangeError(
      `Expected ${name} to be ${allowed.map((option) => `'${option}'`).join(' or ')}, got ${JSON.stringify(value)}.`,
    );
  }
};

/** Today's BS date, 'YYYY-MM-DD', from this device's clock. */
const getBsToday = () => ad2Bs(new Date());

/** Number of days (29–32) in a BS month. Throws for a year outside 1978–2099 or a month outside 1–12. */
const daysInBsMonth = (year: number, month: number) => {
  wholeNumber(year, 'year');
  wholeNumber(month, 'month');
  if (year < MIN_BS_YEAR || year > MAX_BS_YEAR) {
    throw new RangeError(
      `BS year ${year} is outside the supported range (${MIN_BS_YEAR} to ${MAX_BS_YEAR}).`,
    );
  }
  if (month < 1 || month > 12) {
    throw new RangeError(`BS month ${month} is not between 1 and 12.`);
  }
  return dates[year][month];
};

/** Day of the week of a BS date: 0 = Sunday … 6 = Saturday. */
const getBsWeekday = (bsDate: string) => new Date(adToUtcMs(bs2Ad(bsDate))).getUTCDay();

/** A BS date `days` days later (or earlier, when negative). */
const addBsDays = (bsDate: string, days: number) => {
  const adDate = utcMsToAd(adToUtcMs(bs2Ad(bsDate)) + wholeNumber(days, 'days') * DAY_MS);
  if (!isSupportedAdDate(adDate)) {
    throw new RangeError(
      `Adding ${days} days to "${bsDate}" goes outside the supported range (${MIN_BS_DATE} to ${MAX_BS_DATE}).`,
    );
  }
  return ad2Bs(adDate);
};

/** A BS date `months` months later (or earlier); the day is clamped to the target month's length. */
const addBsMonths = (bsDate: string, months: number) => {
  const { year, month, day } = dateString2Obj(validateBsDate(bsDate));
  const index = year * 12 + month - 1 + wholeNumber(months, 'months');
  const targetYear = Math.floor(index / 12);
  const targetMonth = (index % 12) + 1;
  const length = daysInBsMonth(targetYear, targetMonth);
  return createDateString(targetYear, targetMonth, Math.min(day, length));
};

/** A BS date `years` years later (or earlier); the day is clamped to the target month's length. */
const addBsYears = (bsDate: string, years: number) =>
  addBsMonths(bsDate, wholeNumber(years, 'years') * 12);

/** Whole days from `from` to `to`, negative when `to` is earlier. */
const bsDaysBetween = (from: string, to: string) =>
  Math.round((adToUtcMs(bs2Ad(to)) - adToUtcMs(bs2Ad(from))) / DAY_MS);

/** A BS date in words, e.g. '२५ आश्विन २०८३', or '25 Asoj 2083' with `locale: 'en'`. */
const formatBsDate = (
  bsDate: string,
  { locale = 'ne', numerals, weekday = false }: FormatBsDateOptions = {},
) => {
  oneOf(locale, 'locale', ['en', 'ne']);
  if (numerals !== undefined) oneOf(numerals, 'numerals', ['latin', 'devanagari']);
  const adDate = bs2Ad(bsDate);
  const display = { locale, numerals: numerals ?? (locale === 'ne' ? 'devanagari' : 'latin') };
  const text = formatDate(adDate, 'BS', display);
  if (!weekday) return text;
  const name = weekdayNames('BS', display).long[new Date(adToUtcMs(adDate)).getUTCDay()];
  return `${name}, ${text}`;
};

export {
  getBsToday,
  daysInBsMonth,
  getBsWeekday,
  addBsDays,
  addBsMonths,
  addBsYears,
  bsDaysBetween,
  formatBsDate,
};
