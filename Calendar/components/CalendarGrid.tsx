import { IUseCalendarData } from '../../types/IHooks/IUseCalendarData';
import { ICalendar } from '../types';

const CalendarGrid = (props: ICalendar.CalendarGridProps) => {
  const { dates, showExtra, onSelect } = props;
  return (
    <>
      {dates.map((date: unknown, i: number) => {
        return (
          <div key={i} className='_patro_dates'>
            {Array.isArray(date) &&
              date.map((item: IUseCalendarData.IDates, index: number) => {
                return (
                  <p
                    title={item.adDate}
                    onClick={() => onSelect(item)}
                    key={i + index}
                    className={item.type}
                  >
                    {item.dayOfMonth}
                    {showExtra && <sub>{item.extraDate}</sub>}
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
