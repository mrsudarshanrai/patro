import { createDateString, en2NpNumber, remove1stZero } from 'utils';
import {
  dates as bsDates,
  weeksDaysCount,
  config,
  dates,
  MIN_BS_YEAR,
} from 'constants/dateConstants';
import { switchYear } from '../dateUtils';
import { bs2Ad } from './bs2ad';
import { IUseCalendarData } from 'types/IHooks/IUseCalendarData';
import { ad2Bs, getRawAdDates } from 'utils/ad_utils';
import { IDateUtils } from 'types/IUtils/IDateUtils';
const { en, np } = config;

const getBsMonthStartingDay = (arr: any) => {
  for (let a = 0; a < arr.length; a++) {
    const index = arr[a].findIndex((item: any) => item.extraDate === '०१');
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

type IGetPrevMonthDatesOffset = [monthCount: number, length: number, year: number, month: number];

const getBsPrevMonthDatesOffset = (...args: IGetPrevMonthDatesOffset) => {
  const [monthCount, length, year, month] = args;
  const { year: YEAR, month: MONTH } = switchYear(year, month);

  if (length != 0)
    return Array.from({ length: monthCount }, (_, i) => ({
      dayOfMonth: en2NpNumber(String(i + 1)),
      year,
      month: MONTH,
      adDate: bs2Ad(createDateString(YEAR, MONTH, i + 1)),
      bsDate: createDateString(YEAR, MONTH, i + 1),
      extraDate: bs2Ad(createDateString(YEAR, MONTH, i + 1)).split('-')[2],
      type: '_patro_dates_date _patro_dates_current_month_date _patro_dates_date_offset _patro_dates_prev_month_date_offset',
    })).slice(-length);
  return [];
};

type ICreateBsMonths = [length: number, year: number, month: number];
const createBsMonths = (...args: ICreateBsMonths) => {
  const [length, year, month] = args;

  return Array.from({ length }, (_, i) => ({
    dayOfMonth: en2NpNumber(String(i + 1)),
    year,
    month,
    adDate: bs2Ad(createDateString(year, month, i + 1)),
    bsDate: createDateString(year, month, i + 1),
    extraDate: bs2Ad(createDateString(year, month, i + 1)).split('-')[2],
    type: '_patro_dates_date _patro_dates_current_month_date',
  }));
};

type IGetNextMonthDatesOffset = [monthCount: number, length: number, year: number, month: number];

const getBsNextMonthDatesOffset = (...args: IGetNextMonthDatesOffset) => {
  const [monthCount, length, year, month] = args;
  const { year: YEAR, month: MONTH } = switchYear(year, month);

  return Array.from({ length: monthCount }, (_, i) => {
    return {
      dayOfMonth: en2NpNumber(String(i + 1)),
      year: YEAR,
      month: MONTH + 1,
      adDate: bs2Ad(createDateString(YEAR, MONTH, i + 1)),
      bsDate: createDateString(YEAR, MONTH, i + 1),
      extraDate: bs2Ad(createDateString(YEAR, MONTH, i + 1)).split('-')[2],
      type: '_patro_dates_date _patro_dates_current_month_date _patro_dates_date_offset _patro_dates_next_month_date_offset',
    };
  }).slice(0, weeksDaysCount - length);
};

const getRawBsDates = (...args: any) => {
  const [bsDate, adDates, YEAR, MONTH, date, currDate] = args;
  const { year, month } = switchYear(YEAR, MONTH);
  let cells: IUseCalendarData.IDates[] = [];
  const dates: any[] = [];
  const [bsYear, bsMonth, _] = bsDate.split('-');
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

  const previousMonthBsDates = getBsPrevMonthDatesOffset(
    previousBsMonthDatesCount,
    bsMonthStartDayIndex,
    bsYear,
    +remove1stZero(bsMonth) - 1,
  );
  const currentBsMonthDates = createBsMonths(
    currentBsMonthDatesCount,
    bsYear,
    +remove1stZero(bsMonth),
  );
  const nextMonthBsDates = getBsNextMonthDatesOffset(
    nextBsMonthDatesCount,
    nextBsMonthStartDayIndex,
    bsYear,
    +remove1stZero(bsMonth) + 1,
  );

  const rawDate = [...previousMonthBsDates, ...currentBsMonthDates, ...nextMonthBsDates];
  rawDate.forEach((row: IUseCalendarData.IDates, i) => {
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

const getPrevMonthDatesOffset = (...args: IDateUtils.IGetMonthOffset_Params) => {
  const [monthCount, length, month, year] = args;
  const prevMonth = month - 1 <= 0 ? '01' : month - 1;
  if (length != 0)
    return Array.from({ length: monthCount }, (_, i) => ({
      dayOfMonth: i + 1,
      year,
      month: month - 1,
      adDate: createDateString(year, month - 1, i + 1),
      extraDate: en2NpNumber(ad2Bs(createDateString(year, +prevMonth, i + 1)).split('-')[2]),
      type: '_patro_dates_date _patro_dates_current_month_date _patro_dates_date_offset _patro_dates_prev_month_date_offset',
    })).slice(-length);
  return [];
};

const getNextMonthDatesOffset = (...args: IDateUtils.IGetMonthOffset_Params) => {
  const [monthCount, length, month, year] = args;
  const { year: YEAR, month: MONTH } = switchYear(year, month + 1);
  return Array.from({ length: monthCount }, (_, i) => ({
    dayOfMonth: i + 1,
    year: YEAR,
    month: MONTH + 1,
    adDate: createDateString(YEAR, MONTH, i + 1),
    extraDate: en2NpNumber(ad2Bs(createDateString(YEAR, MONTH, i + 1)).split('-')[2]),
    type: '_patro_dates_date _patro_dates_current_month_date _patro_dates_date_offset _patro_dates_next_month_date_offset',
  })).slice(0, weeksDaysCount - length);
};

export {
  getBsMonthStartingDay,
  createBsMonths,
  getBsPrevMonthDatesOffset,
  getBsNextMonthDatesOffset,
  getBSMonthYear,
  getRawBsDates,
  getBsHeaderMonth,
  evaluateNepaliDate,
  getPrevMonthDatesOffset,
  getNextMonthDatesOffset,
  bs2Ad,
};
