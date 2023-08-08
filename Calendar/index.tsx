import { useState } from 'react';
import { useCalendarData } from '../hooks/useCalendarData';
import '../scss/style.scss';
import { IUseCalendarData } from '../types/IHooks/IUseCalendarData';
import { CalendarGrid } from './components/CalendarGrid';
import CalendarHeader from './components/CalendarHeader';
import { ICalendar } from './types';
import CalendarDays from './components/CalendarDays';

const Calendar = (props: ICalendar.IProps) => {
  const { onChange, calendarType = ICalendar.CalendarTypeEnum.AD, showExtra } = props;
  const [selectedDate, setSelectedDate] = useState(new Date());

  // get calendar data
  const [dates, dateObj, nextMonth, prevMonth] = useCalendarData(calendarType, selectedDate);
  const {
    headerMonths: { month, oMonth, oYear, year },
  } = dateObj || {};

  // on date select
  const onSelect = (date: IUseCalendarData.IDates) => {
    setSelectedDate(() => new Date(date.adDate));
    onChange && onChange(date);
  };

  console.log(dates);
  return (
    <div className='_patro_container _patro'>
      <CalendarHeader
        nextMonth={nextMonth}
        prevMonth={prevMonth}
        month={month}
        year={year}
        oMonth={oMonth}
        oYear={oYear}
      />
      <CalendarDays calendarType={calendarType} />
      <CalendarGrid dates={dates} onSelect={onSelect} showExtra={showExtra} />
    </div>
  );
};

export { Calendar };
