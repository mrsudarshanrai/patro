import React from "react";
import {
  CURR_MONTH,
  CURR_YEAR,
  getMonthDays,
  getMonth,
  getMonthFirstDay,
} from "../utils";

const useCalanderData = (date?: Date) => {
  const [currMonth, setCurrMonth] = React.useState(CURR_MONTH);
  const [currYear, setCurrYear] = React.useState(CURR_YEAR);

  const monthDays = getMonthDays(currMonth, currYear);
  const monthName = getMonth(currMonth);
  const monthFirstDays = getMonthFirstDay(currMonth, currYear);

  React.useEffect(() => {
    if (date && "getMonth" in date) {
      setCurrMonth(date.getMonth() + 1);
      setCurrYear(date.getFullYear());
    }
  }, [date]);

  const arr: any = [];
  const blanks: any = [];
  let cells: any = [];
  const rows: any = [];

  for (let i = 0; i < monthFirstDays - 1; i++) {
    blanks.push(<p></p>);
  }
  for (let j = 1; j <= monthDays; j++) {
    arr.push(
      <p className={`${date?.getDate() === j ? "_patro_current_date" : ""}`}>
        {j}
      </p>
    );
  }

  [...blanks, ...arr].forEach((row, i) => {
    if (i % 7 !== 0) {
      cells.push(row);
    } else {
      rows.push(cells);
      cells = [];
      cells.push(row);
    }
    if (i === [...blanks, ...arr].length - 1) {
      rows.push(cells);
    }
  });

  const nextMonth = () => {
    setCurrMonth((prev) => prev + 1);
  };

  const prevMonth = () => {
    setCurrMonth((prev) => prev - 1);
  };

  return [rows, nextMonth, prevMonth];
};

export { useCalanderData };
