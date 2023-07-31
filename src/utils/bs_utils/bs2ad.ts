import { MAX_BS_YEAR, MIN_BS_YEAR, START_ENGLISH_DATE, dates } from '../../constants/dateConstants';
import { createDateString } from '../dateUtils';
import { dateString2Obj } from 'utils';

/** BS date sanitizer */
const isBsYearValid = (year: number) => year < MIN_BS_YEAR || year > MAX_BS_YEAR;
const isBsDayValid = (day: number, year: number, month: number) => {
  return day > dates[year][month];
};

const validateBsDate = (date: string) => {
  const { year, month, day } = dateString2Obj(date);
  if (isBsYearValid(year)) throw new Error('BS Date out of range');

  if (isBsDayValid(day, year, month)) throw new Error(`No ${day} day exits in this month.`);

  return createDateString(year, month, day);
};

const evaluateEnglishDate = (date: string, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  const year = result.getFullYear();
  const month = result.getMonth() + 1;
  const day = result.getDate();
  return `${year}-${month > 9 ? month : '0' + month}-${day > 9 ? day : '0' + day}`;
};

const bs2Ad = (bsDate: string) => {
  const [year, month, day] = validateBsDate(bsDate)
    .split('-')
    .map((item) => parseInt(item));
  let daysDiff = 0;
  for (let i = MIN_BS_YEAR; i <= year; i++) {
    if (i === year) {
      for (let j = 1; j < month; j++) {
        daysDiff += dates[i][j];
      }
      daysDiff += day - 1;
    } else {
      for (let j = 1; j <= 12; j++) {
        daysDiff += dates[i][j];
      }
    }
  }
  return evaluateEnglishDate(START_ENGLISH_DATE, daysDiff);
};

export { bs2Ad };
