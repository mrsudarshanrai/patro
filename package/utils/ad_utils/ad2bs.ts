import { createDateString, dateString2Obj, getDates, toAdDateString } from '../dateUtils';
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
  if (day > getDates(month, year)) throw new RangeError(`"${date}" is not a valid AD date.`);

  const validated = createDateString(year, month, day);
  if (validated < START_ENGLISH_DATE || validated > MAX_AD_DATE) {
    throw new RangeError(
      `AD date "${date}" is outside the supported range (${START_ENGLISH_DATE} to ${MAX_AD_DATE}).`,
    );
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

/** AD 'YYYY-MM-DD' (or a `Date`, read in local time) to BS 'YYYY-MM-DD'. Throws for invalid or unsupported dates. */
const ad2Bs = (adDate: string | Date) => {
  const input = adDate instanceof Date ? toAdDateString(adDate) : adDate;
  const daysDifference = Math.round(
    (toUtcMs(validateAdDate(input)) - toUtcMs(START_ENGLISH_DATE)) / 86400000,
  );
  return evaluateNepaliDate(daysDifference);
};

const isValidAdDate = (adDate: string) => {
  try {
    validateAdDate(adDate);
    return true;
  } catch {
    return false;
  }
};

export { ad2Bs, evaluateNepaliDate, isValidAdDate };
