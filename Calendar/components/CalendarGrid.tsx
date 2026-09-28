import { IUseCalendarData } from '../../types/IHooks/IUseCalendarData';
import { adDateToLocalDate, formatDisplayDate } from '../../utils';
import { ICalendar } from '../types';

const cellClassName = (
  { isToday, isSelected, offset }: IUseCalendarData.IDates,
  isFocused: boolean,
) =>
  [
    '_patro_dates_date',
    '_patro_dates_current_month_date',
    offset && '_patro_dates_date_offset',
    offset && `_patro_dates_${offset}_month_date_offset`,
    isSelected && '_patro_dates_current_date',
    isToday && '_patro_dates_today',
    isFocused && '_patro_dates_focused',
  ]
    .filter(Boolean)
    .join(' ');

const cellLabel = (adDate: string) => {
  const date = adDateToLocalDate(adDate);
  return `${formatDisplayDate(date, 'AD')}, ${formatDisplayDate(date, 'BS')}`;
};

const cellId = (idPrefix: string, adDate: string) => `${idPrefix}-${adDate}`;

const CalendarGrid = (props: ICalendar.CalendarGridProps) => {
  const { dates, showExtra, onSelect, idPrefix, focusedAdDate } = props;
  return (
    <>
      {dates.map((days: IUseCalendarData.IDates[], i: number) => {
        return (
          <div key={i} className='_patro_dates' role='row'>
            {Array.isArray(days) &&
              days.map((date: IUseCalendarData.IDates, index: number) => {
                const { adDate, dayOfMonth, extraDate } = date;
                return (
                  <p
                    id={cellId(idPrefix, adDate)}
                    role='gridcell'
                    aria-selected={date.isSelected}
                    aria-label={cellLabel(adDate)}
                    title={adDate}
                    onClick={() => onSelect({ adDate })}
                    key={i + index}
                    className={cellClassName(date, adDate === focusedAdDate)}
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

export { CalendarGrid, cellId };
