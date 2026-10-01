import { weekdayNames } from '../../utils';
import type { CalendarDaysProps } from '../CalendarType';

const rotate = <T,>(items: T[], by: number) => [...items.slice(by), ...items.slice(0, by)];

const CalendarDays = ({ calendar, display, weekStartsOn, weekendDays = [] }: CalendarDaysProps) => {
  const names = weekdayNames(calendar, display);
  const long = rotate(names.long, weekStartsOn);
  const short = rotate(names.short, weekStartsOn);
  return (
    <div className='_patro_days' role='row'>
      {short.map((day, index) => (
        <div
          className={
            weekendDays.includes((index + weekStartsOn) % 7)
              ? '_patro_days_day _patro_days_day_weekend'
              : '_patro_days_day'
          }
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
