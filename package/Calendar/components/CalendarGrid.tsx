import {
  DisplayOptions,
  formatDate,
  formatNumber,
  GridCell,
  otherSystem,
  toPatroDate,
} from '../../utils';
import { CalendarSystem } from '../../types/public';
import type { CalendarGridProps } from '../CalendarType';

type Range = NonNullable<CalendarGridProps['range']>;

// Where a day sits in the selected (or previewed) range.
const rangeState = (adDate: string, range?: Range) => {
  if (!range?.start) return undefined;
  const last = range.end ?? range.preview;
  const hasBand = !!last && last !== range.start;
  return {
    selected: adDate === range.start || adDate === range.end,
    ariaSelected: adDate >= range.start && adDate <= (range.end ?? range.start),
    start: hasBand && adDate === range.start,
    end: hasBand && adDate === last,
    inside: !!last && adDate > range.start && adDate < last,
    preview: !range.end && !!range.preview,
  };
};

const cellClassName = (
  { isToday, isSelected, isDisabled, isWeekend, offset }: GridCell,
  isFocused: boolean,
  inRange?: ReturnType<typeof rangeState>,
) =>
  [
    '_patro_dates_date',
    '_patro_dates_current_month_date',
    isWeekend && '_patro_dates_weekend',
    offset && '_patro_dates_date_offset',
    offset && `_patro_dates_${offset}_month_date_offset`,
    (inRange ? inRange.selected : isSelected) && '_patro_dates_current_date',
    inRange?.start && '_patro_dates_range_start',
    inRange?.end && '_patro_dates_range_end',
    inRange?.inside && '_patro_dates_in_range',
    inRange?.preview && (inRange.inside || inRange.end) && '_patro_dates_range_preview',
    isToday && '_patro_dates_today',
    isDisabled && '_patro_dates_disabled',
    isFocused && '_patro_dates_focused',
  ]
    .filter(Boolean)
    .join(' ');

const cellLabel = ({ adDate, secondaryDay }: GridCell, display: DisplayOptions) => {
  const ad = formatDate(adDate, 'AD', display);
  return secondaryDay === null ? ad : `${ad}, ${formatDate(adDate, 'BS', display)}`;
};

const number = (value: number | null, system: CalendarSystem, display: DisplayOptions) =>
  value === null ? '' : formatNumber(value, system, display);

const cellId = (idPrefix: string, adDate: string) => `${idPrefix}-${adDate}`;

const CalendarGrid = (props: CalendarGridProps) => {
  const {
    dates,
    calendar,
    display,
    showSecondaryDate,
    onSelect,
    idPrefix,
    focusedAdDate,
    dayClassName,
    dayContent,
    dayLabel,
    hideOutsideDays,
    range,
    onHoverDay,
  } = props;
  return (
    <>
      {dates.map((days: GridCell[], i: number) => {
        return (
          <div key={i} className='_patro_dates' role='row'>
            {days.map((date: GridCell, index: number) => {
              const { adDate, day, secondaryDay } = date;
              if (hideOutsideDays && date.offset) {
                return (
                  <p
                    key={i + index}
                    role='gridcell'
                    className='_patro_dates_date _patro_dates_hidden'
                  />
                );
              }
              const inRange = range && rangeState(adDate, range);
              // Days outside the BS table have no PatroDate.
              const patroDate = secondaryDay !== null ? toPatroDate(adDate) : null;
              const extraLabel = patroDate && dayLabel?.(patroDate);
              const content = patroDate && dayContent?.(patroDate);
              return (
                <p
                  id={cellId(idPrefix, adDate)}
                  role='gridcell'
                  aria-selected={inRange ? inRange.ariaSelected : date.isSelected}
                  aria-disabled={date.isDisabled || undefined}
                  aria-label={[cellLabel(date, display), extraLabel].filter(Boolean).join(', ')}
                  title={adDate}
                  onClick={date.isDisabled ? undefined : () => onSelect(adDate)}
                  onMouseEnter={
                    onHoverDay && !date.isDisabled ? () => onHoverDay(adDate) : undefined
                  }
                  key={i + index}
                  className={[
                    cellClassName(date, adDate === focusedAdDate, inRange),
                    patroDate && dayClassName?.(patroDate),
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <span className='_patro_dates_date_primary'>
                    {number(day, calendar, display)}
                  </span>
                  {showSecondaryDate && (
                    <sub>{number(secondaryDay, otherSystem(calendar), display)}</sub>
                  )}
                  {content != null && content !== false && (
                    <span className='_patro_dates_content'>{content}</span>
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
