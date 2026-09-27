import { IUseCalendarData } from '../../types/IHooks/IUseCalendarData';
import { ICalendar } from '../types';

const cellClassName = ({ isToday, isSelected, offset }: IUseCalendarData.IDates) =>
  [
    '_patro_dates_date',
    '_patro_dates_current_month_date',
    offset && '_patro_dates_date_offset',
    offset && `_patro_dates_${offset}_month_date_offset`,
    isSelected && '_patro_dates_current_date',
    isToday && '_patro_dates_today',
  ]
    .filter(Boolean)
    .join(' ');

const CalendarGrid = (props: ICalendar.CalendarGridProps) => {
  const { dates, showExtra, onSelect } = props;
  return (
    <>
      {dates.map((days: IUseCalendarData.IDates[], i: number) => {
        return (
          <div key={i} className='_patro_dates'>
            {Array.isArray(days) &&
              days.map((date: IUseCalendarData.IDates, index: number) => {
                const { adDate, dayOfMonth, extraDate } = date;
                return (
                  <p
                    title={adDate}
                    onClick={() => onSelect({ adDate })}
                    key={i + index}
                    className={cellClassName(date)}
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
