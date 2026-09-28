import { KeyboardEvent, useEffect, useId, useRef, useState } from 'react';
import { useCalendarData } from '../hooks/useCalendarData';
import '../scss/style.scss';
import { IUseCalendarData } from '../types/IHooks/IUseCalendarData';
import { CalendarGrid, cellId } from './components/CalendarGrid';
import CalendarHeader from './components/CalendarHeader';
import { ICalendar } from './types';
import CalendarDays from './components/CalendarDays';
import { ad2Bs, adDateToLocalDate, addDays, createDateString, getToday } from '../utils';

const DAY_STEPS: Record<string, number> = {
  ArrowLeft: -1,
  ArrowRight: 1,
  ArrowUp: -7,
  ArrowDown: 7,
};

const isSupported = (adDate: string) => {
  try {
    ad2Bs(adDate);
    return true;
  } catch {
    return false;
  }
};

const Calendar = (props: ICalendar.IProps) => {
  const {
    onChange,
    calendarType = ICalendar.CalendarTypeEnum.AD,
    showExtra,
    defaultDate,
    theme,
  } = props;
  const [selectedDate, setSelectedDate] = useState(defaultDate ?? new Date());
  const [focusedAdDate, setFocusedAdDate] = useState<string>();
  const [showFocusRing, setShowFocusRing] = useState(false);
  const pointerDown = useRef(false);
  const idPrefix = useId();

  // Re-sync when a parent (e.g. Datepicker) passes a new date, not just on mount.
  useEffect(() => {
    if (defaultDate) setSelectedDate(defaultDate);
  }, [defaultDate?.getTime()]);

  const {
    dates,
    adDate: selectedAdDate,
    header: { month, oMonth, oYear, year },
    nextMonth,
    prevMonth,
  } = useCalendarData(calendarType, selectedDate);

  const monthCells = dates.flat().filter((cell) => !cell.offset);
  const monthStart = monthCells[0].adDate;
  const monthEnd = monthCells[monthCells.length - 1].adDate;
  const inView = (adDate?: string) => !!adDate && adDate >= monthStart && adDate <= monthEnd;
  const today = getToday();
  // Keep focus on something visible after month changes: focused, else selected, else today.
  const activeAdDate =
    [focusedAdDate, selectedAdDate, createDateString(today.year, today.month, today.date)].find(
      inView,
    ) ?? monthStart;

  const onSelect = (date: IUseCalendarData.IDates) => {
    setSelectedDate(() => adDateToLocalDate(date.adDate));
    setFocusedAdDate(date.adDate);
    onChange?.(date);
  };

  const onGridKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = DAY_STEPS[event.key];
    if (step !== undefined) {
      event.preventDefault();
      const next = addDays(activeAdDate, step);
      if (!isSupported(next)) return;
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
      onSelect({ adDate: activeAdDate } as IUseCalendarData.IDates);
    }
  };

  return (
    <div className='_patro_container _patro' data-calendar-type={calendarType} data-theme={theme}>
      <CalendarHeader
        nextMonth={nextMonth}
        prevMonth={prevMonth}
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
        <CalendarDays calendarType={calendarType} />
        <CalendarGrid
          dates={dates}
          onSelect={onSelect}
          showExtra={showExtra}
          idPrefix={idPrefix}
          focusedAdDate={showFocusRing ? activeAdDate : undefined}
        />
      </div>
    </div>
  );
};

export { Calendar };
