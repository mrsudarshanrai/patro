import { dates as bsDates, weeksDaysCount } from '../../constants/dateConstants';
import {
  createDateString,
  en2NpNumber,
  isTodayAdDate,
  remove1stZero,
  switchYear,
} from '../dateUtils';
import { getOffsetMonthDates } from '../gridUtils';
import { bs2Ad } from './bs2ad';
import { IUseCalendarData } from '../../types/IHooks/IUseCalendarData';
import { getRawAdDates } from '../ad_utils';
import { BSutil } from './types';

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

  return Array.from({ length }, (_, i) => {
    const adDate = bs2Ad(createDateString(year, month, i + 1));

    return {
      dayOfMonth: en2NpNumber(String(i + 1)),
      year,
      month,
      adDate,
      extraDate: adDate.split('-')[2],
      isToday: isTodayAdDate(adDate),
      isSelected:
        year === selectedBs.year && month === selectedBs.month && i + 1 === selectedBs.date,
    };
  });
};

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

export { getBsMonthStartingDay, createBsMonths, getBSMonthYear, getRawBsDates, bs2Ad };
