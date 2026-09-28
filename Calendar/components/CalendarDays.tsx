import { weekdayNames } from '../../utils';
import { ICalendar } from '../types';

const rotate = <T,>(items: T[], by: number) => [...items.slice(by), ...items.slice(0, by)];

const CalendarDays = ({ calendar, display, weekStartsOn }: ICalendar.CalendarDaysProps) => {
  const names = weekdayNames(calendar, display);
  const long = rotate(names.long, weekStartsOn);
  const short = rotate(names.short, weekStartsOn);
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
