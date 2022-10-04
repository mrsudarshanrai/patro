import React from "react";
import "./App.css";
import { useCalanderData } from "../hooks/useCalanderData";
import { getMonth, CURR_MONTH, WEEK_DAYS } from "../utils";

function Datepicker() {
  const monthName = getMonth(CURR_MONTH);
  const [rows, nextMonth, prevMonth] = useCalanderData();

  return (
    <div className="App">
      <div className="_patro_container">
        <h3>{monthName} 2022</h3>
        <div className="_patro_days">
          {Object.values(WEEK_DAYS).map((day: string, i: number) => (
            <div key={i + day}>{day}</div>
          ))}
        </div>
        {rows.map((x: React.ReactNode, i: number) => {
          return (
            <div key={i + Math.random()} className="_patro_dates">
              {x}
            </div>
          );
        })}
      </div>
      <button onClick={() => prevMonth()}>Prev</button>
      <button onClick={() => nextMonth()}>Next</button>
    </div>
  );
}

export default Datepicker;
