import { dateString2Obj, evaluateNepaliDate, remove1stZero } from '..';
import { createDateString } from '../dateUtils';
import { START_ENGLISH_DATE, MAX_AD_DATE, config } from '../../constants/dateConstants';
import { ICalendar } from '../../Calendar/types';
const { np, en } = config;

const isAd = (value: string) => value === ICalendar.CalendarTypeEnum.AD;

/** AD date sanitizer: day/month/year shape is already checked by dateString2Obj */
const validateAdDate = (date: string) => {
  const { year, month, day } = dateString2Obj(date);
  const validated = createDateString(year, month, day);

  if (validated > MAX_AD_DATE) throw new Error('AD Date out of range');

  return validated;
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
const toUtcMs = (date: string) => {
  const { year, month, day } = dateString2Obj(date);
  return Date.UTC(year, month - 1, day);
};

const ad2Bs = (adDate: string) => {
  const daysDifference = Math.round(
    (toUtcMs(validateAdDate(adDate)) - toUtcMs(START_ENGLISH_DATE)) / 86400000,
  );
  if (daysDifference < 0) {
    throw new Error('AD Date out of range');
  }
  return evaluateNepaliDate(daysDifference);
};

export { isAd, getAdHeaderMonth, ad2Bs };
