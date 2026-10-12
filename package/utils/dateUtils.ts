import { DEVANAGARI_DIGITS, MAX_AD_DATE, START_ENGLISH_DATE } from '../constants/dateConstants';
import type { DateInput, DateRange, DateRangeInput } from '../types/public';

const EMPTY_RANGE: DateRange = { start: null, end: null };

// The Date constructors read years 0–99 as 1900–1999; setting the full year afterwards doesn't.
const utcDate = (year: number, monthIndex: number, day: number) => {
  const date = new Date(Date.UTC(year, monthIndex, day));
  date.setUTCFullYear(year, monthIndex, day);
  return date;
};

const localDate = (year: number, monthIndex: number, day: number) => {
  const date = new Date(year, monthIndex, day);
  date.setFullYear(year, monthIndex, day);
  return date;
};

const getDates = (month: number, year: number) => utcDate(year, month, 0).getUTCDate();

const getMonthFirstDay = (month: number, year: number) => utcDate(year, month - 1, 1).getUTCDay();

const switchYear = (year: number, month: number) => {
  if (month > 12) return { year: +year + 1, month: 1 };
  if (month <= 0) return { year: +year - 1, month: 12 };
  else return { year, month };
};

const zeroPad = (value: number, length = 2) => String(value).padStart(length, '0');

const createDateString = (year: number, month: number, date = 1) =>
  `${zeroPad(year, 4)}-${zeroPad(month)}-${zeroPad(date)}`;

const addDays = (adDate: string, days: number) => {
  const { year, month, day } = dateString2Obj(adDate);
  const result = utcDate(year, month - 1, day + days);
  return createDateString(result.getUTCFullYear(), result.getUTCMonth() + 1, result.getUTCDate());
};

// Read at call time so a page left open past midnight moves on to the new day.
const getToday = () => {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1, date: now.getDate() };
};

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const toLatinDigits = (value: string) =>
  value.replace(/[०-९]/g, (digit) => String(DEVANAGARI_DIGITS.indexOf(digit)));

// Accepts 'YYYY-MM-DD' in Latin or Devanagari digits; the day is checked against the month by callers.
const dateString2Obj = (date: string) => {
  if (typeof date !== 'string') {
    throw new TypeError(
      `Expected a 'YYYY-MM-DD' string, got ${date === null ? 'null' : typeof date}.`,
    );
  }
  const match = DATE_PATTERN.exec(toLatinDigits(date));
  if (!match) throw new RangeError(`Invalid date "${date}": expected 'YYYY-MM-DD'.`);
  const [year, month, day] = match.slice(1).map(Number);
  if (month < 1 || month > 12 || day < 1 || day > 32) {
    throw new RangeError(`Invalid date "${date}".`);
  }
  return { year, month, day };
};

const isSupportedAdDate = (adDate: string) => adDate >= START_ENGLISH_DATE && adDate <= MAX_AD_DATE;

const clampAdDate = (adDate: string, min = START_ENGLISH_DATE, max = MAX_AD_DATE) =>
  adDate < min ? min : adDate > max ? max : adDate;

const toAdDateString = (date: Date) =>
  createDateString(date.getFullYear(), date.getMonth() + 1, date.getDate());

const warned = new Set<string>();
const warnOnce = (message: string) => {
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') return;
  if (warned.has(message)) return;
  warned.add(message);
  console.warn(`patrojs: ${message}`);
};

const parseDateInput = (input: DateInput): Date | null => {
  if (input instanceof Date) return Number.isNaN(input.getTime()) ? null : input;
  if (typeof input !== 'string') return null;
  try {
    const { year, month, day } = dateString2Obj(input);
    return day <= getDates(month, year) ? localDate(year, month - 1, day) : null;
  } catch {
    return null;
  }
};

// Any real day, supported by the BS table or not, so a far-off minDate still clamps.
const toInputDate = (input: DateInput | null | undefined): Date | null => {
  if (input === null || input === undefined) return null;
  const date = parseDateInput(input);
  if (!date) {
    warnOnce(
      `${input instanceof Date ? 'an Invalid Date' : JSON.stringify(input)} isn't a date; expected a Date or an AD 'YYYY-MM-DD' string. It's treated as no date.`,
    );
  }
  return date;
};

const toInputAdDate = (input: DateInput | null | undefined) => {
  const date = toInputDate(input);
  return date && toAdDateString(date);
};

const supportedAdDate = (input: DateInput | null | undefined) => {
  const adDate = toInputAdDate(input);
  if (adDate && !isSupportedAdDate(adDate)) {
    warnOnce(
      `${adDate} is outside the supported range (${START_ENGLISH_DATE} to ${MAX_AD_DATE}), so it's treated as no date.`,
    );
    return null;
  }
  return adDate;
};

// A range given end-first is treated as the same range, start-first.
const supportedAdRange = (range: DateRangeInput) => {
  const start = supportedAdDate(range.start);
  const end = supportedAdDate(range.end);
  return start && end && end < start ? { start: end, end: start } : { start, end };
};

// `new Date('YYYY-MM-DD')` parses as UTC midnight: the previous day west of UTC.
const adDateToLocalDate = (adDate: string) => {
  const { year, month, day } = dateString2Obj(adDate);
  return localDate(year, month - 1, day);
};

const en2NpNumber = (value: string) =>
  value.replace(/[0-9]/g, (digit) => DEVANAGARI_DIGITS[Number(digit)]);

const remove1stZero = (value: string) => value.replace(/^0+/, '');

export {
  EMPTY_RANGE,
  zeroPad,
  createDateString,
  addDays,
  getDates,
  getMonthFirstDay,
  switchYear,
  getToday,
  dateString2Obj,
  toLatinDigits,
  adDateToLocalDate,
  isSupportedAdDate,
  clampAdDate,
  toAdDateString,
  toInputDate,
  toInputAdDate,
  supportedAdDate,
  supportedAdRange,
  en2NpNumber,
  remove1stZero,
};
