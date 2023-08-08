import { dateString2Obj, evaluateNepaliDate, remove1stZero } from '..';
import { createDateString } from '../dateUtils';
import { START_ENGLISH_DATE, config } from '../../constants/dateConstants';
import { ICalendar } from '../../Calendar/types';
const { np, en } = config;

const isAd = (value: string) => value === ICalendar.CalendarTypeEnum.AD;

/** AD date sanitizer */
const isAdYearValid = (year: number) => year > 2040;
const isAdMonthValid = (month: number) => month > 31;

const validateAdDate = (date: string) => {
  const { year, month, day } = dateString2Obj(date);

  if (isAdYearValid(year)) throw new Error('AD Date out of range');

  if (isAdMonthValid(month)) throw new Error('Month is invalid.');

  return createDateString(year, month, day);
};

const getAdHeaderMonth = (bsMonth: string, adMonth: number, bsYear: string, adYear: string) => {
  const parsedBsMonth = parseInt(remove1stZero(bsMonth));
  const npMonths = Object.keys(np.months);
  const beforeMonthIndex = parsedBsMonth - 2;
  return {
    oMonth: `${npMonths[beforeMonthIndex < 0 ? 11 : beforeMonthIndex]}/${
      npMonths[parsedBsMonth - 1]
    } - `,
    month: Object.keys(en.months)[adMonth - 1],
    oYear: bsYear,
    year: adYear,
  };
};

/** AD To BS */
const ad2Bs = (adDate: string) => {
  const startDate = new Date(START_ENGLISH_DATE);
  const today = new Date(validateAdDate(adDate));
  const daysDifference = Math.floor((today.getTime() - startDate.getTime()) / 86400000);
  if (daysDifference < 0) {
    throw new Error('AD Date out of range');
  }
  return evaluateNepaliDate(daysDifference);
};

export { isAd, getAdHeaderMonth, ad2Bs };
