import { useState, useEffect } from "react";
import {
  getDates,
  getMonth,
  getMonthFirstDay,
  createDateArrayOfLength,
  getPrevMonthDatesOffset,
  getNextMonthDatesOffset,
  buildDate,
} from "../utils/dateUtils";

import { current_month, current_year, weeks_days_count } from "../config";

type Imonth = [
  dates: Array<any>,
  dateObj: {
    year: number;
    month: number;
    monthName: string;
    dateString: Date;
  },
  nextMonth: () => void,
  prevMonth: () => void
];

const useCalendarData = (date?: Date, isAd?: boolean): Imonth => {
  let cells: any = [];
  const dates: any = [];
  const [year, setYear] = useState(current_year);
  const [month, setMonth] = useState(current_month);

  const [nextMonthDates, setNextMonthDates] = useState<Array<React.ReactNode>>(
    []
  );

  useEffect(() => {
    if (date && "getMonth" in date) {
      setMonth(date.getMonth() + 1);
      setYear(date.getFullYear());
    }
  }, [date]);

  const previous_month_Dates_count = getDates(month - 1, year);
  const current_month_dates_count = getDates(month, year);
  const next_month_dates_count = getDates(month + 1, year);

  const getMonthStartDayIndex = getMonthFirstDay(month, year);
  const nextMonthStartDay = getMonthFirstDay(month + 1, year);

  const previous_month_dates = getPrevMonthDatesOffset(
    previous_month_Dates_count,
    getMonthStartDayIndex
  );

  useEffect(() => {
    const next_month_dates = getNextMonthDatesOffset(
      next_month_dates_count,
      nextMonthStartDay
    );
    setNextMonthDates(() => next_month_dates);
  }, [month]);

  const current_month_dates = createDateArrayOfLength(
    current_month_dates_count
  );

  [...previous_month_dates, ...current_month_dates, ...nextMonthDates].forEach(
    (row, i) => {
      if (i % weeks_days_count !== 0) {
        cells.push(row);
      } else {
        dates.push(cells);
        cells = [];
        cells.push(row);
      }
      if (
        i ===
        [...previous_month_dates, ...current_month_dates, ...nextMonthDates]
          .length -
          1
      ) {
        dates.push(cells);
      }
    }
  );

  const nextMonth = () => {
    if (month === 12) {
      setYear((prevYear) => prevYear + 1);
      setMonth(() => 1);
    } else setMonth((prev) => prev + 1);
  };

  const prevMonth = () => {
    if (month <= 1) {
      setYear((prevYear) => prevYear - 1);
      setMonth(() => 12);
    } else setMonth((prev) => prev - 1);
  };

  const dateObj = {
    year,
    month,
    monthName: getMonth(month),
    dateString: buildDate(year, month),
  };
  return [dates, dateObj, nextMonth, prevMonth];
};

export { useCalendarData };
