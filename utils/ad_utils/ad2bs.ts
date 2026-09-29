import { createDateString, dateString2Obj, getDates } from '../dateUtils';
import {
  START_ENGLISH_DATE,
  MAX_AD_DATE,
  MIN_BS_YEAR,
  MAX_BS_YEAR,
  bsYearStartDays,
  dates,
} from '../../constants/dateConstants';

const validateAdDate = (date: string) => {
  const { year, month, day } = dateString2Obj(date);
  if (day > getDates(month, year)) throw new Error(`No ${day} day exists in this month.`);

  const validated = createDateString(year, month, day);
  if (validated < START_ENGLISH_DATE || validated > MAX_AD_DATE) {
    throw new Error('AD Date out of range');
  }

  return validated;
};

const toUtcMs = (date: string) => {
  const { year, month, day } = dateString2Obj(date);
  return Date.UTC(year, month - 1, day);
};

const evaluateNepaliDate = (daysElapsed: number) => {
  // A BS year is never longer than 366 days, so this never overshoots.
  let year = Math.min(MAX_BS_YEAR, MIN_BS_YEAR + Math.floor(daysElapsed / 366));
  while (year < MAX_BS_YEAR && bsYearStartDays[year + 1] <= daysElapsed) year++;

  let remaining = daysElapsed - bsYearStartDays[year];
  let month = 1;
  while (remaining >= dates[year][month]) remaining -= dates[year][month++];

  return createDateString(year, month, remaining + 1);
};

const ad2Bs = (adDate: string) => {
  const daysDifference = Math.round(
    (toUtcMs(validateAdDate(adDate)) - toUtcMs(START_ENGLISH_DATE)) / 86400000,
  );
  return evaluateNepaliDate(daysDifference);
};

export { ad2Bs, evaluateNepaliDate };
