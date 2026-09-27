import { useEffect, useState } from 'react';
import { useCalendarData } from '../hooks/useCalendarData';
import '../scss/style.scss';
import { IUseCalendarData } from '../types/IHooks/IUseCalendarData';
import { CalendarGrid } from './components/CalendarGrid';
import CalendarHeader from './components/CalendarHeader';
import { ICalendar } from './types';
import CalendarDays from './components/CalendarDays';
import { adDateToLocalDate } from '../utils';

const Calendar = (props: ICalendar.IProps) => {
  const {
    onChange,
    calendarType = ICalendar.CalendarTypeEnum.AD,
    showExtra,
    defaultDate,
    theme,
  } = props;
  const [selectedDate, setSelectedDate] = useState(defaultDate ?? new Date());

  // Re-sync when a parent (e.g. Datepicker) passes a new date, not just on mount.
  useEffect(() => {
    if (defaultDate) setSelectedDate(defaultDate);
  }, [defaultDate?.getTime()]);

  const {
    dates,
    header: { month, oMonth, oYear, year },
    nextMonth,
    prevMonth,
  } = useCalendarData(calendarType, selectedDate);

  const onSelect = (date: IUseCalendarData.IDates) => {
    setSelectedDate(() => adDateToLocalDate(date.adDate));
    onChange?.(date);
  };

  return (
    <div className='_patro_container _patro' data-calendar-type={calendarType} data-theme={theme}>
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
