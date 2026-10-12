import {
  MAX_BS_YEAR,
  MIN_BS_YEAR,
  START_ENGLISH_DATE,
  bsYearStartDays,
  dates,
} from '../../constants/dateConstants';
import { createDateString, dateString2Obj } from '../dateUtils';

const MIN_BS_DATE = createDateString(MIN_BS_YEAR, 1, 1);
const MAX_BS_DATE = createDateString(MAX_BS_YEAR, 12, dates[MAX_BS_YEAR][12]);

const validateBsDate = (date: string) => {
  const { year, month, day } = dateString2Obj(date);
  if (year < MIN_BS_YEAR || year > MAX_BS_YEAR) {
    throw new RangeError(
      `BS date "${date}" is outside the supported range (${MIN_BS_DATE} to ${MAX_BS_DATE}).`,
    );
  }
  if (day > dates[year][month]) throw new RangeError(`"${date}" is not a valid BS date.`);

  return createDateString(year, month, day);
};

const evaluateEnglishDate = (date: string, days: number) => {
  const { year, month, day } = dateString2Obj(date);
  const result = new Date(Date.UTC(year, month - 1, day + days));
  return createDateString(result.getUTCFullYear(), result.getUTCMonth() + 1, result.getUTCDate());
};

/** BS 'YYYY-MM-DD' (Latin or Devanagari digits) to AD 'YYYY-MM-DD'. Throws for invalid or unsupported dates. */
const bs2Ad = (bsDate: string) => {
  const { year, month, day } = dateString2Obj(validateBsDate(bsDate));
  let daysDiff = bsYearStartDays[year] + day - 1;
  for (let m = 1; m < month; m++) daysDiff += dates[year][m];
  return evaluateEnglishDate(START_ENGLISH_DATE, daysDiff);
};

const isValidBsDate = (bsDate: string) => {
  try {
    validateBsDate(bsDate);
    return true;
  } catch {
    return false;
  }
};

export { bs2Ad, isValidBsDate, validateBsDate, MIN_BS_DATE, MAX_BS_DATE };
