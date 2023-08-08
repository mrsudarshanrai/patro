import { config } from '../../constants/dateConstants';
import { ICalendar } from '../types';
const { en, np } = config;

const CalendarDays = ({ calendarType }: ICalendar.CalendarDaysProps) => {
  return (
    <div className='_patro_days'>
      {Object.values(calendarType === 'AD' ? en.days : np.days).map((day: string, i: number) => (
        <div className='_patro_days_day' key={i + day}>
          {day}
        </div>
      ))}
    </div>
  );
};

export default CalendarDays;
