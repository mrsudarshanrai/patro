import { config } from '../../constants/dateConstants';
import { ICalendar } from '../types';
const { en, np } = config;

const days = (calendarType: ICalendar.calendarType) => {
  return Object.entries(calendarType === ICalendar.CalendarTypeEnum.AD ? en.days : np.days);
};

const CalendarDays = ({ calendarType }: ICalendar.CalendarDaysProps) => {
  return (
    <div className='_patro_days' role='row'>
      {days(calendarType).map(([name, short]) => (
        <div className='_patro_days_day' key={name} role='columnheader' aria-label={name}>
          {short}
        </div>
      ))}
    </div>
  );
};

export default CalendarDays;
