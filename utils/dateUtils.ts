import { config, MAX_AD_DATE, START_ENGLISH_DATE } from '../constants/dateConstants';
import { Constant } from '../constants/types';
const { en, np }: Constant.Config = config;

const getDates = (month: number, year: number) => new Date(year, month, 0).getDate();

const getMonth = (month: number) => Object.keys(en.months)[month - 1];

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

const isDayValid = (day: number) => day > 32 || day < 1 || !day;
const isMonthValid = (month: number) => month > 12 || month < 1 || !month;
const isYearValid = (year: number) => !year || year.toString().length < 4;

const dateString2Obj = (date: string) => {
  const splittedDate = date.split('-');
  if (splittedDate.length !== 3) throw new Error('Date format is invalid');
  const [year, month, day] = date.split('-').map((item) => parseInt(item));
  if (isDayValid(day)) throw new Error('Day is invalid.');
  if (isMonthValid(month)) throw new Error('Month is invalid.');

  if (isYearValid(year)) throw new Error('Year is invalid.');

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
  value
    .split('')
    .map((item: unknown) => np.numbers[item as keyof Constant.NPNumbers])
    .join('');

const remove1stZero = (value: string) => value.replace(/^0+/, '');

export {
  zeroPad,
  createDateString,
  addDays,
  getDates,
  getMonthFirstDay,
  getMonth,
  switchYear,
  getToday,
  isTodayAdDate,
  dateString2Obj,
  adDateToLocalDate,
  isSupportedAdDate,
  clampAdDate,
  toAdDateString,
  en2NpNumber,
  remove1stZero,
};
