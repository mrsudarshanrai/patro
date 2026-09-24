import { createDateString, en2NpNumber, remove1stZero } from '../../utils';
import {
  dates as bsDates,
  weeksDaysCount,
  config,
  dates,
  MIN_BS_YEAR,
} from '../../constants/dateConstants';
import { switchYear, getOffsetMonthDates } from '../dateUtils';
import { bs2Ad } from './bs2ad';
import { IUseCalendarData } from '../../types/IHooks/IUseCalendarData';
import { getRawAdDates } from '../../utils/ad_utils';
import { BSutil } from './types';
const { en, np } = config;

const getBsMonthStartingDay = (arr: Array<BSutil.Date[]>) => {
  for (let a = 0; a < arr.length; a++) {
    const index = arr[a].findIndex((item: BSutil.Date) => item.extraDate === '०१');
    if (index > -1) {
      return index;
    }
  }
};

const getBSMonthYear = (month: number, currentBsYear: number) => {
  if (month > 12) {
    const newBsYear = currentBsYear + 1;
    return {
      bsYearDates: bsDates[newBsYear],
      bsMonthCount: bsDates[newBsYear][1],
    };
  } else if (month < 1) {
    const newBsYear = currentBsYear - 1;
    return {
      bsYearDates: bsDates[newBsYear],
      bsMonthCount: bsDates[newBsYear][12],
    };
  } else
    return {
      bsYearDates: bsDates[currentBsYear],
      bsMonthCount: bsDates[currentBsYear][month],
    };
};

type ICreateBsMonths = [
  length: number,
  year: number,
  month: number,
  selectedBs: IUseCalendarData.ICurrDate,
];
const createBsMonths = (...args: ICreateBsMonths) => {
  const [length, year, month, selectedBs] = args;

  return Array.from({ length }, (_, i) => ({
    dayOfMonth: en2NpNumber(String(i + 1)),
    year,
    month,
    adDate: bs2Ad(createDateString(year, month, i + 1)),
    extraDate: bs2Ad(createDateString(year, month, i + 1)).split('-')[2],
    type: `_patro_dates_date _patro_dates_current_month_date ${
      month === selectedBs.month && i + 1 === selectedBs.date ? '_patro_dates_current_date' : ''
    }`,
  }));
};

/**
 *
 * @param bsDate
 * @param YEAR
 * @param MONTH
 * @param date
 * @param currDate
 * @param selectedBs
 * @returns
 */
const getRawBsDates = (
  bsDate: string,
  YEAR: number,
  MONTH: number,
  date: number,
  currDate: IUseCalendarData.ICurrDate,
  selectedBs: IUseCalendarData.ICurrDate,
) => {
  const { year, month } = switchYear(YEAR, MONTH);
  let cells: BSutil.Date[] = [];
  const dates: Array<BSutil.Date[]> = [];
  const [bsYear, bsMonth] = bsDate.split('-');
  const bsMonthStartDayIndex = getBsMonthStartingDay(getRawAdDates(year, month, date, currDate));
  const nextBsMonthStartDayIndex = getBsMonthStartingDay(
    getRawAdDates(year, month + 1, date, currDate),
  );

  const { bsMonthCount: previousBsMonthDatesCount } = getBSMonthYear(
    parseInt(remove1stZero(bsMonth)) - 1,
    parseInt(bsYear),
  );
  const { bsMonthCount: currentBsMonthDatesCount } = getBSMonthYear(
    parseInt(remove1stZero(bsMonth)),
    parseInt(bsYear),
  );
  const { bsMonthCount: nextBsMonthDatesCount } = getBSMonthYear(
    parseInt(remove1stZero(bsMonth)) + 1,
    parseInt(bsYear),
  );

  const previousMonthBsDates = getOffsetMonthDates({
    monthCount: previousBsMonthDatesCount,
    length: bsMonthStartDayIndex,
    year: parseInt(bsYear),
    month: +remove1stZero(bsMonth) - 1,
    direction: 'prev',
    self: 'BS',
    convertToOther: bs2Ad,
  });
  const currentBsMonthDates = createBsMonths(
    currentBsMonthDatesCount,
    parseInt(bsYear),
    +remove1stZero(bsMonth),
    selectedBs,
  );
  const nextMonthBsDates = getOffsetMonthDates({
    monthCount: nextBsMonthDatesCount,
    length: nextBsMonthStartDayIndex,
    year: parseInt(bsYear),
    month: +remove1stZero(bsMonth) + 1,
    direction: 'next',
    self: 'BS',
    convertToOther: bs2Ad,
  });

  const rawDate = [...previousMonthBsDates, ...currentBsMonthDates, ...nextMonthBsDates];
  rawDate.forEach((row: BSutil.Date, i) => {
    if (i % weeksDaysCount !== 0) {
      cells.push(row);
    } else {
      dates.push(cells);
      cells = [];
      cells.push(row);
    }
    if (i === rawDate.length - 1) {
      dates.push(cells);
    }
  });
  return dates;
};

const evaluateNepaliDate = (daysElpased: number) => {
  let currentYear = 0;
  let currentMonth = 0;
  let currentDay = 0;
  let totalD = 0;
  let flag = false;

  for (let i = MIN_BS_YEAR; i < 2100; i++) {
    if (flag) {
      break;
    }
    for (let j = 1; j <= 12; j++) {
      totalD += dates[i][j];
      if (daysElpased - totalD < 0) {
        currentDay = daysElpased - totalD + dates[i][j] + 1;
        flag = true;
        currentYear = i;
        currentMonth = j;
        break;
      }
    }
  }
  return createDateString(currentYear, currentMonth, currentDay);
};

const getBsHeaderMonth = (bsMonth: string, adMonth: number, bsYear: string, adYear: string) => {
  const parsedBsMonth = parseInt(remove1stZero(bsMonth));
  const enMonths = Object.values(en.months);
  const beforeMonthIndex = adMonth - 1;
  return {
    oMonth: `${enMonths[beforeMonthIndex < 0 ? 11 : beforeMonthIndex]}/${
      enMonths[adMonth === 12 ? 0 : adMonth]
    } - `,
    month: Object.keys(np.months)[parsedBsMonth - 1],
    oYear: adYear,
    year: bsYear,
  };
};

export {
  getBsMonthStartingDay,
  createBsMonths,
  getBSMonthYear,
  getRawBsDates,
  getBsHeaderMonth,
  evaluateNepaliDate,
  bs2Ad,
};
