import { KeyboardEvent, useEffect, useId, useRef, useState } from 'react';
import { useCalendarData } from '../hooks/useCalendarData';
import { CalendarProps } from '../types/public';
import { CalendarGrid, cellId } from './components/CalendarGrid';
import CalendarHeader from './components/CalendarHeader';
import { ICalendar } from './types';
import CalendarDays from './components/CalendarDays';
import {
  addDays,
  clampAdDate,
  createDateString,
  DisplayOptions,
  getToday,
  monthRange,
  monthTitle,
  toPatroDate,
} from '../utils';

const DAY_STEPS: Record<string, number> = {
  ArrowLeft: -1,
  ArrowRight: 1,
  ArrowUp: -7,
  ArrowDown: 7,
};

const Calendar = (props: CalendarProps) => {
  const {
    value,
    defaultValue,
    onChange,
    calendar = ICalendar.CalendarTypeEnum.AD,
    showSecondaryDate = true,
    theme,
    minDate,
    maxDate,
    isDateDisabled,
    locale,
    numerals,
    weekStartsOn = 0,
    fixedWeeks = true,
    weekendDays,
    dayClassName,
    onMonthChange,
    className,
    style,
  } = props;
  const isControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<Date | null>(
    defaultValue === undefined ? new Date() : defaultValue,
  );
  const selectedDate = isControlled ? value : uncontrolledValue;
  const [focusedAdDate, setFocusedAdDate] = useState<string>();
  const [showFocusRing, setShowFocusRing] = useState(false);
  const pointerDown = useRef(false);
  const idPrefix = useId();

  const {
    dates,
    adDate: selectedAdDate,
    firstAdDate,
    lastAdDate,
    nextMonth,
    prevMonth,
    canNextMonth,
    canPrevMonth,
    minAdDate,
    maxAdDate,
    isDayDisabled,
  } = useCalendarData(calendar, selectedDate, {
    minDate,
    maxDate,
    isDateDisabled,
    weekStartsOn,
    fixedWeeks,
    weekendDays,
  });

  // Latest callback in a ref so an inline onMonthChange doesn't refire the effect every render.
  const onMonthChangeRef = useRef(onMonthChange);
  useEffect(() => {
    onMonthChangeRef.current = onMonthChange;
  });
  const shownMonth = useRef(firstAdDate);
  useEffect(() => {
    if (shownMonth.current === firstAdDate) return;
    shownMonth.current = firstAdDate;
    onMonthChangeRef.current?.({
      start: toPatroDate(clampAdDate(firstAdDate)),
      end: toPatroDate(clampAdDate(lastAdDate)),
    });
  }, [firstAdDate, lastAdDate]);

  const display: DisplayOptions = { locale, numerals };
  const title = monthTitle(firstAdDate, calendar, display);
  const subtitle = monthRange(firstAdDate, lastAdDate, calendar, display);

  const ownDays = dates.flat().filter((cell) => !cell.offset);
  const enabledDays = ownDays.filter((cell) => !cell.isDisabled);
  const monthCells = enabledDays.length ? enabledDays : ownDays;
  const monthStart = monthCells[0].adDate;
  const monthEnd = monthCells[monthCells.length - 1].adDate;
  const inView = (adDate?: string) =>
    !!adDate && adDate >= monthStart && adDate <= monthEnd && !isDayDisabled(adDate);
  const today = getToday();
  // Keep focus on something visible after month changes: focused, else selected, else today.
  const activeAdDate =
    [
      focusedAdDate,
      selectedAdDate ?? undefined,
      createDateString(today.year, today.month, today.date),
    ].find(inView) ?? monthStart;

  const onSelect = (adDate: string) => {
    const selected = toPatroDate(adDate);
    if (!isControlled) setUncontrolledValue(selected.date);
    setFocusedAdDate(adDate);
    onChange?.(selected);
  };

  const onGridKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = DAY_STEPS[event.key];
    if (step !== undefined) {
      event.preventDefault();
      let next = addDays(activeAdDate, step);
      while (next >= minAdDate && next <= maxAdDate && isDayDisabled(next)) {
        next = addDays(next, step);
      }
      if (next < minAdDate || next > maxAdDate) return;
      if (next < monthStart) prevMonth();
      if (next > monthEnd) nextMonth();
      setFocusedAdDate(next);
      setShowFocusRing(true);
    } else if (event.key === 'PageUp' || event.key === 'PageDown') {
      event.preventDefault();
      if (event.key === 'PageUp') prevMonth();
      else nextMonth();
      setShowFocusRing(true);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!isDayDisabled(activeAdDate)) onSelect(activeAdDate);
    }
  };

  return (
    <div
      className={['_patro_container _patro', className].filter(Boolean).join(' ')}
      style={style}
      data-calendar-type={calendar}
      data-theme={theme}
    >
      <CalendarHeader
        nextMonth={nextMonth}
        prevMonth={prevMonth}
        canNextMonth={canNextMonth}
        canPrevMonth={canPrevMonth}
        title={title}
        subtitle={subtitle}
      />
      <div
        className='_patro_grid'
        role='grid'
        tabIndex={0}
        aria-label={title}
        aria-activedescendant={cellId(idPrefix, activeAdDate)}
        onKeyDown={onGridKeyDown}
        onMouseDown={() => (pointerDown.current = true)}
        // Ring only for keyboard focus, like :focus-visible.
        onFocus={() => setShowFocusRing(!pointerDown.current)}
        onBlur={() => {
          pointerDown.current = false;
          setShowFocusRing(false);
        }}
      >
        <CalendarDays
          calendar={calendar}
          display={display}
          weekStartsOn={weekStartsOn}
          weekendDays={weekendDays}
        />
        <CalendarGrid
          dates={dates}
          calendar={calendar}
          display={display}
          onSelect={onSelect}
          showSecondaryDate={showSecondaryDate}
          idPrefix={idPrefix}
          dayClassName={dayClassName}
          focusedAdDate={showFocusRing ? activeAdDate : undefined}
        />
      </div>
    </div>
  );
};

export { Calendar };
