import { useEffect, useState } from 'react';
import { useCalendarData } from '../hooks/useCalendarData';
import '../scss/style.scss';
import { IUseCalendarData } from '../types/IHooks/IUseCalendarData';
import { CalendarGrid } from './components/CalendarGrid';
import CalendarHeader from './components/CalendarHeader';
import { ICalendar } from './types';
import CalendarDays from './components/CalendarDays';

const Calendar = (props: ICalendar.IProps) => {
  const { onChange, calendarType = ICalendar.CalendarTypeEnum.AD, showExtra, defaultDate } = props;
  const [selectedDate, setSelectedDate] = useState(defaultDate ?? new Date());

  // Re-sync when a controlling parent (e.g. Datepicker) passes a new date,
  // not just on mount.
  useEffect(() => {
    if (defaultDate) setSelectedDate(defaultDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultDate?.getTime()]);

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
