import { weekdayNames } from '../../utils';
import { ICalendar } from '../types';

const CalendarDays = ({ calendar, display }: ICalendar.CalendarDaysProps) => {
  const { long, short } = weekdayNames(calendar, display);
  return (
    <div className='_patro_days' role='row'>
      {short.map((day, index) => (
        <div
          className='_patro_days_day'
          key={long[index]}
          role='columnheader'
          aria-label={long[index]}
        >
          {day}
        </div>
      ))}
    </div>
  );
};

export default CalendarDays;
