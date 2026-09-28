import { IUseCalendarData } from '../../types/IHooks/IUseCalendarData';
import { DisplayOptions, formatDate, formatNumber, otherSystem } from '../../utils';
import { CalendarSystem } from '../../types/public';
import { ICalendar } from '../types';

const cellClassName = (
  { isToday, isSelected, isDisabled, isWeekend, offset }: IUseCalendarData.IDates,
  isFocused: boolean,
) =>
  [
    '_patro_dates_date',
    '_patro_dates_current_month_date',
    isWeekend && '_patro_dates_weekend',
    offset && '_patro_dates_date_offset',
    offset && `_patro_dates_${offset}_month_date_offset`,
    isSelected && '_patro_dates_current_date',
    isToday && '_patro_dates_today',
    isDisabled && '_patro_dates_disabled',
    isFocused && '_patro_dates_focused',
  ]
    .filter(Boolean)
    .join(' ');

const cellLabel = ({ adDate, secondaryDay }: IUseCalendarData.IDates, display: DisplayOptions) => {
  const ad = formatDate(adDate, 'AD', display);
  return secondaryDay === null ? ad : `${ad}, ${formatDate(adDate, 'BS', display)}`;
};

const number = (value: number | null, system: CalendarSystem, display: DisplayOptions) =>
  value === null ? '' : formatNumber(value, system, display);

const cellId = (idPrefix: string, adDate: string) => `${idPrefix}-${adDate}`;

const CalendarGrid = (props: ICalendar.CalendarGridProps) => {
  const { dates, calendar, display, showSecondaryDate, onSelect, idPrefix, focusedAdDate } = props;
  return (
    <>
      {dates.map((days: IUseCalendarData.IDates[], i: number) => {
        return (
          <div key={i} className='_patro_dates' role='row'>
            {days.map((date: IUseCalendarData.IDates, index: number) => {
              const { adDate, day, secondaryDay } = date;
              return (
                <p
                  id={cellId(idPrefix, adDate)}
                  role='gridcell'
                  aria-selected={date.isSelected}
                  aria-disabled={date.isDisabled || undefined}
                  aria-label={cellLabel(date, display)}
                  title={adDate}
                  onClick={date.isDisabled ? undefined : () => onSelect(adDate)}
                  key={i + index}
                  className={cellClassName(date, adDate === focusedAdDate)}
                >
                  <span className='_patro_dates_date_primary'>
                    {number(day, calendar, display)}
                  </span>
                  {showSecondaryDate && (
                    <sub>{number(secondaryDay, otherSystem(calendar), display)}</sub>
                  )}
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
