import { config } from '../../constants/dateConstants';
import { ICalendar } from '../types';
const { en, np } = config;

const days = (calendarType: ICalendar.calendarType) => {
  return Object.values(calendarType === ICalendar.CalendarTypeEnum.AD ? en.days : np.days);
};

const CalendarDays = ({ calendarType }: ICalendar.CalendarDaysProps) => {
  return (
    <div className='_patro_days'>
      {days(calendarType).map((day: string) => (
        <div className='_patro_days_day' key={day}>
          {day}
        </div>
      ))}
    </div>
  );
};

export default CalendarDays;
