import { current_year, current_month, months, weeks_days_count } from "config";

const zeroPad = (value: number | undefined) => ("0" + value).slice(-2);
const buildDate = (year: number, month: number, date?: number) =>
  new Date(`${year}-${zeroPad(month)}-${date || "01"}`);

const getDates = (month = current_month, year = current_year) => {
  const months30 = [4, 6, 9, 11];
  const leapYear = year % 4 === 0;
  return month === 2
    ? leapYear
      ? 29
      : 28
    : months30.includes(month)
    ? 30
    : 31;
};

const getMonth = (month: number) => Object.keys(months)[month - 1];

const getMonthFirstDay = (month = current_month, year = current_year) => {
  return +new Date(`${year}-${zeroPad(month)}-01`).getDay();
};

const createDateArrayOfLength = (length: number) =>
  Array.from({ length }, (_, i) => ({
    date: i + 1,
    type: "_patro_dates_date _patro_dates_current_month_date",
  }));

const getPrevMonthDatesOffset = (month_count: number, length: number) => {
  if (length != 0)
    return Array.from({ length: month_count }, (_, i) => ({
      date: i + 1,
      type: "_patro_dates_date _patro_dates_current_month_date _patro_dates_date_offset _patro_dates_prev_month_date_offset",
    })).slice(-length);
  return [];
};

const getNextMonthDatesOffset = (month_count: number, length: number) =>
  Array.from({ length: month_count }, (_, i) => ({
    date: i + 1,
    type: "_patro_dates_date _patro_dates_current_month_date _patro_dates_date_offset _patro_dates_next_month_date_offset",
  })).slice(0, weeks_days_count - length);

export {
  zeroPad,
  buildDate,
  getDates,
  getMonthFirstDay,
  getMonth,
  createDateArrayOfLength,
  getPrevMonthDatesOffset,
  getNextMonthDatesOffset,
};
