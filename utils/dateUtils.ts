import { ICalendar } from '../Calendar/types';
import { currentYear, currentMonth, weeksDaysCount, config } from '../constants/dateConstants';
import { Constant } from '../constants/types';
import { IDateUtils } from '../types/IUtils/IDateUtils';
import { ad2Bs, getAdHeaderMonth, isAd } from './ad_utils';
import { getBsHeaderMonth } from './bs_utils';
const { en, np }: Constant.Config = config;

const getDates = (month = currentMonth, year = currentYear) => new Date(year, month, 0).getDate();

const getMonth = (month: number) => Object.keys(en.months)[month - 1];

const getMonthFirstDay = (month = currentMonth, year = currentYear) => {
  // Local numeric construction avoids the UTC-vs-local mismatch that comes
  // from parsing a date-only ISO string (which is parsed as UTC midnight)
  // and then reading its local weekday.
  return new Date(year, month - 1, 1).getDay();
};

const switchYear = (year: number, month: number) => {
  if (month > 12) return { year: +year + 1, month: 1 };
  if (month <= 0) return { year: +year - 1, month: 12 };
  else return { year, month };
};
const createDateArray = (...args: IDateUtils.ICreateDateArray_Params) => {
  const [length, month, year, date, currDate] = args;
  const { month: currMonth } = currDate;

  return Array.from({ length }, (_, i) => {
    const dayOfMonth = i + 1;
    const adDate = createDateString(year, month, i + 1);
    const extraDate = en2NpNumber(ad2Bs(createDateString(year, month, i + 1)).split('-')[2]);
    const type = `_patro_dates_date _patro_dates_current_month_date ${
      month === currMonth && date === i + 1 ? '_patro_dates_current_date' : ''
    }`;

    return {
      dayOfMonth,
      year,
      month,
      adDate,
      extraDate,
      type,
    };
  });
};

const zeroPad = (value: number | undefined) => ('0' + value).slice(-2);

const createDateString = (year: number, month: number, date?: number) =>
  `${year}-${zeroPad(month)}-${zeroPad(date) || '01'}`;

/** data sanitizer */
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

const en2NpNumber = (value: string) =>
  value
    .split('')
    .map((item: unknown) => np.numbers[item as keyof Constant.NPNumbers])
    .join('');

const remove1stZero = (value: string) => value.replace(/^0+/, '');

const OFFSET_CELL_CLASS = {
  prev: '_patro_dates_date _patro_dates_current_month_date _patro_dates_date_offset _patro_dates_prev_month_date_offset',
  next: '_patro_dates_date _patro_dates_current_month_date _patro_dates_date_offset _patro_dates_next_month_date_offset',
};

/**
 * Builds the leading ("prev") or trailing ("next") spillover day-cells shown
 * around a month's own days in the calendar grid, for either calendar
 * system. Always routes the offset month through `switchYear` so a month
 * that rolls past January/December also rolls its year — that wraparound
 * used to be hand-rolled separately per direction and per calendar system,
 * and the one hand-rolled copy that skipped switchYear was the source of
 * the AD/BS mismatch at year boundaries.
 */
const getOffsetMonthDates = (params: IDateUtils.IOffsetMonthDates_Params) => {
  const { monthCount, length, direction, self, convertToOther } = params;
  const { year, month } = switchYear(params.year, params.month);

  if (direction === 'prev' && length === 0) return [];

  const cells = Array.from({ length: monthCount }, (_, i) => {
    const ownDate = createDateString(year, month, i + 1);
    const otherDate = convertToOther(ownDate);

    return self === 'AD'
      ? {
          dayOfMonth: i + 1,
          year,
          month,
          adDate: ownDate,
          extraDate: en2NpNumber(otherDate.split('-')[2]),
          type: OFFSET_CELL_CLASS[direction],
        }
      : {
          dayOfMonth: en2NpNumber(String(i + 1)),
          year,
          month,
          adDate: otherDate,
          extraDate: otherDate.split('-')[2],
          type: OFFSET_CELL_CLASS[direction],
        };
  });

  return direction === 'prev' ? cells.slice(-length) : cells.slice(0, weeksDaysCount - length);
};

type IHeaderMonths = [bsMonth: string, adMonth: number, bsYear: string, adYear: string];

const getHeaderMonths = (calendarType: ICalendar.calendarType, ...args: IHeaderMonths) => {
  if (isAd(calendarType)) return getAdHeaderMonth(...args);
  else return getBsHeaderMonth(...args);
};

export {
  zeroPad,
  createDateString,
  getDates,
  getMonthFirstDay,
  getMonth,
  createDateArray,
  switchYear,
  getOffsetMonthDates,
  getHeaderMonths,
  dateString2Obj,
  en2NpNumber,
  remove1stZero,
};
