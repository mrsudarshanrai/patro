const CURR_YEAR = +new Date().getFullYear();

const CURR_MONTH = +new Date().getMonth() + 1;

const WEEK_DAYS = {
  Sunday: "Sun",
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
};

const CALENDAR_MONTHS = {
  January: "Jan",
  February: "Feb",
  March: "Mar",
  April: "Apr",
  May: "May",
  June: "Jun",
  July: "Jul",
  August: "Aug",
  September: "Sep",
  October: "Oct",
  November: "Nov",
  December: "Dec",
};
const CALENDAR_WEEKS = 6;

const zeroPad = (value: number) => ("0" + value).slice(-2);

const getMonthDays = (month = CURR_MONTH, year = CURR_YEAR) => {
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

const getMonth = (month: number) => Object.keys(CALENDAR_MONTHS)[month - 1];

const getMonthFirstDay = (month = CURR_MONTH, year = CURR_YEAR) => {
  return +new Date(`${year}-${zeroPad(month)}-01`).getDay() + 1;
};

export {
  CURR_YEAR,
  CURR_MONTH,
  WEEK_DAYS,
  CALENDAR_MONTHS,
  CALENDAR_WEEKS,
  zeroPad,
  getMonthDays,
  getMonthFirstDay,
  getMonth,
};
