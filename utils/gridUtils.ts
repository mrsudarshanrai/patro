import { weeksDaysCount } from '../constants/dateConstants';
import { IDateUtils } from '../types/IUtils/IDateUtils';
import { createDateString, en2NpNumber, isTodayAdDate, switchYear } from './dateUtils';
import { ad2Bs } from './ad_utils/ad2bs';

const createDateArray = (...args: IDateUtils.ICreateDateArray_Params) => {
  const [length, month, year, date, currDate] = args;
  const { month: currMonth } = currDate;

  return Array.from({ length }, (_, i) => {
    const dayOfMonth = i + 1;
    const adDate = createDateString(year, month, i + 1);
    const extraDate = en2NpNumber(ad2Bs(createDateString(year, month, i + 1)).split('-')[2]);
    const type = `_patro_dates_date _patro_dates_current_month_date ${
      month === currMonth && date === i + 1 ? '_patro_dates_current_date' : ''
    } ${isTodayAdDate(adDate) ? '_patro_dates_today' : ''}`;

    return {
      dayOfMonth,
      year,
      month,
      adDate,
      extraDate,
      type,
    };
  });
};

const OFFSET_CELL_CLASS = {
  prev: '_patro_dates_date _patro_dates_current_month_date _patro_dates_date_offset _patro_dates_prev_month_date_offset',
  next: '_patro_dates_date _patro_dates_current_month_date _patro_dates_date_offset _patro_dates_next_month_date_offset',
};

// Leading ("prev") or trailing ("next") spillover cells around a month, for
// either calendar; switchYear handles the January/December year rollover.
const getOffsetMonthDates = (params: IDateUtils.IOffsetMonthDates_Params) => {
  const { monthCount, length, direction, self, convertToOther } = params;
  const { year, month } = switchYear(params.year, params.month);

  if (direction === 'prev' && length === 0) return [];

  const cells = Array.from({ length: monthCount }, (_, i) => {
    const ownDate = createDateString(year, month, i + 1);
    const otherDate = convertToOther(ownDate);
    const adDate = self === 'AD' ? ownDate : otherDate;
    const type = `${OFFSET_CELL_CLASS[direction]} ${
      isTodayAdDate(adDate) ? '_patro_dates_today' : ''
    }`;

    return self === 'AD'
      ? {
          dayOfMonth: i + 1,
          year,
          month,
          adDate,
          extraDate: en2NpNumber(otherDate.split('-')[2]),
          type,
        }
      : {
          dayOfMonth: en2NpNumber(String(i + 1)),
          year,
          month,
          adDate,
          extraDate: otherDate.split('-')[2],
          type,
        };
  });

  return direction === 'prev' ? cells.slice(-length) : cells.slice(0, weeksDaysCount - length);
};

export { createDateArray, getOffsetMonthDates };
