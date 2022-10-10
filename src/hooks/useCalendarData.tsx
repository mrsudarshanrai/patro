import { useState, useEffect } from "react";
import {
  CURR_MONTH,
  CURR_YEAR,
  getMonthDays,
  getMonth,
  getMonthFirstDay,
} from "../utils";

type Imonth = [
  dates: Array<any>,
  month: string,
  currYear: number,
  nextMonth: () => void,
  prevMonth: () => void
];
const useCalendarData = (date?: Date): Imonth => {
  const [currMonth, setCurrMonth] = useState(CURR_MONTH);
  const [currYear, setCurrYear] = useState(CURR_YEAR);

  const monthDays = getMonthDays(currMonth, currYear);
  const month = getMonth(currMonth);
  const monthFirstDays = getMonthFirstDay(currMonth, currYear);

  useEffect(() => {
    if (date && "getMonth" in date) {
      setCurrMonth(date.getMonth() + 1);
      setCurrYear(date.getFullYear());
    }
  }, [date]);

  const arr: any = [];
  const blanks: any = [];
  let cells: any = [];
  const dates: any = [];

  for (let i = 0; i < monthFirstDays - 1; i++) {
    blanks.push(<p className="_patro_dates_date"></p>);
  }
  for (let j = 1; j <= monthDays; j++) {
    arr.push(
      <p
        className={`${
          date?.getDate() === j
            ? "_patro_current_date _patro_dates_date"
            : "_patro_dates_date"
        }`}
      >
        {j}
      </p>
    );
  }

  [...blanks, ...arr].forEach((row, i) => {
    if (i % 7 !== 0) {
      cells.push(row);
    } else {
      dates.push(cells);
      cells = [];
      cells.push(row);
    }
    if (i === [...blanks, ...arr].length - 1) {
      dates.push(cells);
    }
  });

  const nextMonth = () => {
    if (currMonth === 12) {
      setCurrYear((prevYear) => prevYear + 1);
      setCurrMonth(() => 1);
    } else setCurrMonth((prev) => prev + 1);
  };

  const prevMonth = () => {
    if (currMonth <= 1) {
      setCurrYear((prevYear) => prevYear - 1);
      setCurrMonth(() => 12);
    } else setCurrMonth((prev) => prev - 1);
  };

  return [dates, month, currYear, nextMonth, prevMonth];
};

export { useCalendarData };
