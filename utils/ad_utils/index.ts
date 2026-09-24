import { weeksDaysCount } from '../../constants/dateConstants';
import {
  getDates,
  getMonthFirstDay,
  createDateArray,
  switchYear,
  getOffsetMonthDates,
} from '../dateUtils';
import { AdUtil } from './types';
import { IUseCalendarData } from '../../types/IHooks/IUseCalendarData';
import { ad2Bs } from './ad2bs';

const getRawAdDates = (
  YEAR: number,
  MONTH: number,
  date: number,
  currDate: IUseCalendarData.ICurrDate,
) => {
  let cells: AdUtil.Date[] = [];
  const dates: Array<AdUtil.Date[]> = [];
  const { year, month } = switchYear(YEAR, MONTH);

  /** prev, curr & next month AD dates  */
  const previousMonthDatesCount = getDates(month - 1, year);
  const currentMonthDatesCount = getDates(month, year);
  const nextMonthDatesCount = getDates(month + 1, year);

  const getMonthStartDayIndex = getMonthFirstDay(month, year);
  const nextMonthStartDay = getMonthFirstDay(month + 1, year);

  /** get AD date offsets */
  const previousMonthDates = getOffsetMonthDates({
    monthCount: previousMonthDatesCount,
    length: getMonthStartDayIndex,
    year,
    month: month - 1,
    direction: 'prev',
    self: 'AD',
    convertToOther: ad2Bs,
  });
  const nextMonthDates = getOffsetMonthDates({
    monthCount: nextMonthDatesCount,
    length: nextMonthStartDay,
    year,
    month: month + 1,
    direction: 'next',
    self: 'AD',
    convertToOther: ad2Bs,
  });
  const currentMonthDates = createDateArray(currentMonthDatesCount, month, year, date, currDate);

  const rawDate = [...previousMonthDates, ...currentMonthDates, ...nextMonthDates];
  rawDate.forEach((row: AdUtil.Date, i) => {
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
export { getRawAdDates };
export * from './ad2bs';
