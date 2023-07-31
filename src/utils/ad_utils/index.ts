import { weeksDaysCount } from 'constants/dateConstants';
import { IUseCalendarData } from 'types/IHooks/IUseCalendarData';
import { getDates, getMonthFirstDay, createDateArray, switchYear } from '../dateUtils';
import { getNextMonthDatesOffset, getPrevMonthDatesOffset } from 'utils/bs_utils';

const getRawAdDates = (...args: any) => {
  let cells: IUseCalendarData.IDates[] = [];
  const dates: any[] = [];
  const [YEAR, MONTH, date, currDate] = args;
  const { year, month } = switchYear(YEAR, MONTH);

  /** prev, curr & next month AD dates  */
  const previousMonthDatesCount = getDates(month - 1, year);
  const currentMonthDatesCount = getDates(month, year);
  const nextMonthDatesCount = getDates(month + 1, year);

  const getMonthStartDayIndex = getMonthFirstDay(month, year);
  const nextMonthStartDay = getMonthFirstDay(month + 1, year);

  /** get AD date offsets */
  const previousMonthDates = getPrevMonthDatesOffset(
    previousMonthDatesCount,
    getMonthStartDayIndex,
    month,
    year,
  );
  const nextMonthDates = getNextMonthDatesOffset(
    nextMonthDatesCount,
    nextMonthStartDay,
    month,
    year,
  );
  const currentMonthDates = createDateArray(currentMonthDatesCount, month, year, date, currDate);

  const rawDate = [...previousMonthDates, ...currentMonthDates, ...nextMonthDates];
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
export { getRawAdDates };
export * from './ad2bs';

// const createDateArray = (...args: IDateUtils.ICreateDateArray_Params) => {
//   const [length, month, year, date, currDate] = args;
//   const { month: currMonth } = currDate;

//   return Array.from({ length }, (_, i) => {
//     const date = i + 1;
//     const adDate = createDateString(year, month, i + 1);
//     const extraDate = en2NpNumber(ad2Bs(createDateString(year, month, i + 1)).split('-')[2]);
//     const type = `_patro_dates_date _patro_dates_current_month_date ${
//       month === currMonth && date === i + 1 ? '_patro_dates_current_date' : ''
//     }`;

//     return {
//       date,
//       year,
//       month,
//       adDate,
//       extraDate,
//       type,
//     };
//   });
// };
