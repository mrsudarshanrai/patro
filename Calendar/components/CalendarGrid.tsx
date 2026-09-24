import { IUseCalendarData } from '../../types/IHooks/IUseCalendarData';
import { ICalendar } from '../types';

const CalendarGrid = (props: ICalendar.CalendarGridProps) => {
  const { dates, showExtra, onSelect } = props;
  return (
    <>
      {dates.map((days: IUseCalendarData.IDates[], i: number) => {
        return (
          <div key={i} className='_patro_dates'>
            {Array.isArray(days) &&
              days.map((date: IUseCalendarData.IDates, index: number) => {
                const { adDate, type, dayOfMonth, extraDate } = date;
                return (
                  <p
                    title={adDate}
                    onClick={() => onSelect({ adDate })}
                    key={i + index}
                    className={type}
                  >
                    <span className='_patro_dates_date_primary'>{dayOfMonth}</span>
                    {showExtra && <sub>{extraDate}</sub>}
                  </p>
                );
              })}
          </div>
        );
      })}
    </>
  );
};

export { CalendarGrid };
