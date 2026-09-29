import { DEVANAGARI_DIGITS, MAX_AD_DATE, START_ENGLISH_DATE } from '../constants/dateConstants';

const getDates = (month: number, year: number) => new Date(year, month, 0).getDate();

const getMonthFirstDay = (month: number, year: number) => new Date(year, month - 1, 1).getDay();

const switchYear = (year: number, month: number) => {
  if (month > 12) return { year: +year + 1, month: 1 };
  if (month <= 0) return { year: +year - 1, month: 12 };
  else return { year, month };
};

const zeroPad = (value: number | undefined) => ('0' + value).slice(-2);

const createDateString = (year: number, month: number, date?: number) =>
  `${year}-${zeroPad(month)}-${zeroPad(date) || '01'}`;

const addDays = (adDate: string, days: number) => {
  const { year, month, day } = dateString2Obj(adDate);
  const result = new Date(Date.UTC(year, month - 1, day + days));
  return createDateString(result.getUTCFullYear(), result.getUTCMonth() + 1, result.getUTCDate());
};

// Read at call time so a page left open past midnight moves on to the new day.
const getToday = () => {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1, date: now.getDate() };
};

const isTodayAdDate = (adDate: string) => {
  const { year, month, date } = getToday();
  return adDate === createDateString(year, month, date);
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

// `new Date('YYYY-MM-DD')` parses as UTC midnight: the previous day west of UTC.
const adDateToLocalDate = (adDate: string) => {
  const { year, month, day } = dateString2Obj(adDate);
  return new Date(year, month - 1, day);
};

const en2NpNumber = (value: string) =>
  value.replace(/[0-9]/g, (digit) => DEVANAGARI_DIGITS[Number(digit)]);

const remove1stZero = (value: string) => value.replace(/^0+/, '');

export {
  zeroPad,
  createDateString,
  addDays,
  getDates,
  getMonthFirstDay,
  switchYear,
  getToday,
  isTodayAdDate,
  dateString2Obj,
  toLatinDigits,
  adDateToLocalDate,
  isSupportedAdDate,
  clampAdDate,
  toAdDateString,
  en2NpNumber,
  remove1stZero,
};
