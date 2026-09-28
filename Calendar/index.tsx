import { KeyboardEvent, useId, useRef, useState } from 'react';
import { useCalendarData } from '../hooks/useCalendarData';
import { CalendarProps } from '../types/public';
import { CalendarGrid, cellId } from './components/CalendarGrid';
import CalendarHeader from './components/CalendarHeader';
import { ICalendar } from './types';
import CalendarDays from './components/CalendarDays';
import { addDays, createDateString, getToday, toPatroDate } from '../utils';

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
    header: { month, oMonth, oYear, year },
    nextMonth,
    prevMonth,
    canNextMonth,
    canPrevMonth,
    minAdDate,
    maxAdDate,
    isDayDisabled,
  } = useCalendarData(calendar, selectedDate, { minDate, maxDate, isDateDisabled });

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
    <div className='_patro_container _patro' data-calendar-type={calendar} data-theme={theme}>
      <CalendarHeader
        nextMonth={nextMonth}
        prevMonth={prevMonth}
        canNextMonth={canNextMonth}
        canPrevMonth={canPrevMonth}
        month={month}
        year={year}
        oMonth={oMonth}
        oYear={oYear}
      />
      <div
        className='_patro_grid'
        role='grid'
        tabIndex={0}
        aria-label={`${month} ${year}`}
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
        <CalendarDays calendarType={calendar} />
        <CalendarGrid
          dates={dates}
          onSelect={onSelect}
          showSecondaryDate={showSecondaryDate}
          idPrefix={idPrefix}
          focusedAdDate={showFocusRing ? activeAdDate : undefined}
        />
      </div>
    </div>
  );
};

export { Calendar };
