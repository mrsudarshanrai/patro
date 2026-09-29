import { KeyboardEvent, ReactElement, useEffect, useId, useRef, useState } from 'react';
import { useCalendarData } from '../hooks/useCalendarData';
import { useToday } from '../hooks/useToday';
import {
  CalendarProps,
  CalendarRangeProps,
  CalendarSingleProps,
  DateRange,
  RangeSelection,
  SingleSelection,
} from '../types/public';
import { CalendarGrid, cellId } from './components/CalendarGrid';
import CalendarHeader from './components/CalendarHeader';
import { ICalendar } from './types';
import CalendarDays from './components/CalendarDays';
import { CalendarPicker, PickerView } from './components/CalendarPicker';
import {
  adDateToLocalDate,
  addDays,
  clampAdDate,
  datePartsIn,
  DisplayOptions,
  formatNumber,
  isSupportedAdDate,
  labelsFor,
  monthName,
  monthRange,
  monthSpan,
  monthTitle,
  overlaps,
  supportedAdRange,
  toPatroDate,
  weekday,
  yearSpan,
} from '../utils';

const EMPTY_RANGE: DateRange = { start: null, end: null };

const YEARS_PER_PAGE = 12;

const DAY_STEPS: Record<string, number> = {
  ArrowLeft: -1,
  ArrowRight: 1,
  ArrowUp: -7,
  ArrowDown: 7,
};

const CalendarComponent = (props: CalendarProps) => {
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
    showTodayButton = false,
    today,
    labels,
    autoFocus = false,
    className,
    style,
  } = props;
  const isRange = props.mode === 'range';
  const isControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<Date | DateRange | null>(() =>
    defaultValue !== undefined ? defaultValue : isRange ? EMPTY_RANGE : null,
  );
  const currentValue = isControlled ? value : uncontrolledValue;
  const currentRange = isRange ? ((currentValue as DateRange | null) ?? EMPTY_RANGE) : null;
  const range = currentRange && supportedAdRange(currentRange);
  // In range mode the start anchors the view, like a single selection would.
  const selectedDate = range
    ? range.start && adDateToLocalDate(range.start)
    : (currentValue as Date | null);
  const [hoverAdDate, setHoverAdDate] = useState<string>();
  const [focusedAdDate, setFocusedAdDate] = useState<string>();
  const [view, setView] = useState<PickerView>('days');
  const [pickerYear, setPickerYear] = useState(0);
  const [showFocusRing, setShowFocusRing] = useState(false);
  const pointerDown = useRef(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const idPrefix = useId();
  const todayAdDate = useToday(today);

  const {
    dates,
    adDate: selectedAdDate,
    firstAdDate,
    lastAdDate,
    nextMonth,
    prevMonth,
    goToMonth,
    canNextMonth,
    canPrevMonth,
    minAdDate,
    maxAdDate,
    isDayDisabled,
    pending,
  } = useCalendarData(calendar, selectedDate, {
    minDate,
    maxDate,
    isDateDisabled,
    weekStartsOn,
    fixedWeeks,
    weekendDays,
    today: todayAdDate,
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

  useEffect(() => setView('days'), [calendar]);

  // preventScroll: a popover may not be positioned yet on its first frame.
  useEffect(() => {
    if (autoFocus) gridRef.current?.focus({ preventScroll: true });
  }, [autoFocus]);

  const display: DisplayOptions = { locale, numerals };
  const text = labelsFor(calendar, display, labels);
  const [viewYear, viewMonth] = datePartsIn(firstAdDate, calendar);
  const num = (value: number) => formatNumber(value, calendar, display);
  const yearAvailable = (year: number) => overlaps(yearSpan(calendar, year), minAdDate, maxAdDate);
  const pageStart = pickerYear - (pickerYear % YEARS_PER_PAGE);
  const pageYears = Array.from({ length: YEARS_PER_PAGE }, (_, i) => pageStart + i);
  const pageAvailable = (start: number) =>
    Array.from({ length: YEARS_PER_PAGE }, (_, i) => start + i).some(yearAvailable);
  const pickerYearSpan = yearSpan(calendar, pickerYear);
  const pageFirst = yearSpan(calendar, pageStart);
  const pageLast = yearSpan(calendar, pageStart + YEARS_PER_PAGE - 1);
  const pageSpan = pageFirst && pageLast ? [pageFirst[0], pageLast[1]] : null;

  const todayAllowed =
    !!todayAdDate && isSupportedAdDate(todayAdDate) && !isDayDisabled(todayAdDate);

  const ownDays = dates.flat().filter((cell) => !cell.offset);
  const enabledDays = ownDays.filter((cell) => !cell.isDisabled);
  const monthCells = enabledDays.length ? enabledDays : ownDays;
  const monthStart = monthCells[0].adDate;
  const monthEnd = monthCells[monthCells.length - 1].adDate;
  const inView = (adDate?: string) =>
    !!adDate && adDate >= monthStart && adDate <= monthEnd && !isDayDisabled(adDate);
  // Keep focus on something visible after month changes: focused, else selected, else today.
  const activeAdDate =
    [focusedAdDate, selectedAdDate ?? undefined, todayAdDate ?? undefined].find(inView) ??
    monthStart;

  const onSelect = (adDate: string) => {
    setFocusedAdDate(adDate);
    if (range) {
      const restart = !range.start || !!range.end || adDate < range.start;
      const start = restart ? adDate : (range.start as string);
      const end = restart ? null : adDate;
      if (!isControlled) {
        setUncontrolledValue({
          start: adDateToLocalDate(start),
          end: end ? adDateToLocalDate(end) : null,
        });
      }
      (onChange as RangeSelection['onChange'])?.({
        start: toPatroDate(start),
        end: end ? toPatroDate(end) : null,
      });
      return;
    }
    const selected = toPatroDate(adDate);
    if (!isControlled) setUncontrolledValue(selected.date);
    (onChange as SingleSelection['onChange'])?.(selected);
  };

  const previewEnd =
    range?.start && !range.end
      ? (hoverAdDate ?? (showFocusRing ? activeAdDate : undefined))
      : undefined;
  const gridRange = range && {
    ...range,
    preview: previewEnd && range.start && previewEnd >= range.start ? previewEnd : undefined,
  };

  const goToToday = () => {
    if (!todayAdDate) return;
    const [year, month] = datePartsIn(todayAdDate, calendar);
    goToMonth(year, month);
    setView('days');
    onSelect(todayAdDate);
  };

  const header =
    view === 'days'
      ? {
          title: monthTitle(firstAdDate, calendar, display),
          subtitle: monthRange(firstAdDate, lastAdDate, calendar, display),
          onTitleClick: () => {
            setPickerYear(viewYear);
            setView('months');
          },
          titleActionLabel: text.chooseMonth,
          prev: prevMonth,
          next: nextMonth,
          canPrev: canPrevMonth,
          canNext: canNextMonth,
          prevLabel: text.previousMonth,
          nextLabel: text.nextMonth,
        }
      : view === 'months'
        ? {
            title: num(pickerYear),
            subtitle: pickerYearSpan
              ? monthRange(pickerYearSpan[0], pickerYearSpan[1], calendar, display)
              : '',
            onTitleClick: () => setView('years'),
            titleActionLabel: text.chooseYear,
            prev: () => setPickerYear(pickerYear - 1),
            next: () => setPickerYear(pickerYear + 1),
            canPrev: yearAvailable(pickerYear - 1),
            canNext: yearAvailable(pickerYear + 1),
            prevLabel: text.previousYear,
            nextLabel: text.nextYear,
          }
        : {
            title: `${num(pageStart)} – ${num(pageStart + YEARS_PER_PAGE - 1)}`,
            subtitle: pageSpan ? monthRange(pageSpan[0], pageSpan[1], calendar, display) : '',
            onTitleClick: undefined,
            titleActionLabel: undefined,
            prev: () => setPickerYear(pageStart - YEARS_PER_PAGE),
            next: () => setPickerYear(pageStart + YEARS_PER_PAGE),
            canPrev: pageAvailable(pageStart - YEARS_PER_PAGE),
            canNext: pageAvailable(pageStart + YEARS_PER_PAGE),
            prevLabel: text.previousYears,
            nextLabel: text.nextYears,
          };

  const pickerItems =
    view === 'months'
      ? Array.from({ length: 12 }, (_, i) => ({
          value: i + 1,
          label: monthName(calendar, i + 1, display),
          disabled: !overlaps(monthSpan(calendar, pickerYear, i + 1), minAdDate, maxAdDate),
          current: pickerYear === viewYear && i + 1 === viewMonth,
        }))
      : pageYears.map((year) => ({
          value: year,
          label: num(year),
          disabled: !yearAvailable(year),
          current: year === viewYear,
        }));

  const onPick = (value: number) => {
    if (view === 'months') {
      goToMonth(pickerYear, value);
      setView('days');
    } else {
      setPickerYear(value);
      setView('months');
    }
  };

  // Same day `months` away in the displayed calendar, clamped to that month's length.
  const shiftMonths = (adDate: string, months: number) => {
    const [year, month, day] = datePartsIn(adDate, calendar);
    const index = year * 12 + month - 1 + months;
    const span = monthSpan(calendar, Math.floor(index / 12), (index % 12) + 1);
    if (!span) return null;
    const target = addDays(span[0], day - 1);
    return target > span[1] ? span[1] : target;
  };

  const moveFocus = (adDate: string | null) => {
    setShowFocusRing(true);
    if (!adDate || adDate < minAdDate || adDate > maxAdDate) return;
    const [year, month] = datePartsIn(adDate, calendar);
    goToMonth(year, month);
    setFocusedAdDate(adDate);
  };

  const onGridKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = DAY_STEPS[event.key];
    if (step !== undefined) {
      event.preventDefault();
      let next = addDays(activeAdDate, step);
      while (next >= minAdDate && next <= maxAdDate && isDayDisabled(next)) {
        next = addDays(next, step);
      }
      moveFocus(next);
    } else if (event.key === 'PageUp' || event.key === 'PageDown') {
      // Shift pages by year, as in the WAI-ARIA date picker pattern.
      event.preventDefault();
      const months = (event.key === 'PageUp' ? -1 : 1) * (event.shiftKey ? 12 : 1);
      const next = shiftMonths(activeAdDate, months);
      moveFocus(next && (next < minAdDate ? minAdDate : next > maxAdDate ? maxAdDate : next));
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      const column = (weekday(activeAdDate) - weekStartsOn + 7) % 7;
      const back = event.key === 'Home' ? -1 : 1;
      let next = addDays(activeAdDate, back < 0 ? -column : 6 - column);
      // Nearest enabled day of the week, towards the focused one.
      while (next !== activeAdDate && isDayDisabled(next)) next = addDays(next, -back);
      moveFocus(next);
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
      // Month unknown until the browser's today is (server render / hydration); CSS hides the placeholder.
      aria-busy={pending || undefined}
      onKeyDown={(event) => {
        if (view === 'days' || event.key !== 'Escape') return;
        event.stopPropagation();
        setView('days');
      }}
    >
      <CalendarHeader
        nextMonth={header.next}
        prevMonth={header.prev}
        canNextMonth={header.canNext}
        canPrevMonth={header.canPrev}
        title={header.title}
        subtitle={header.subtitle}
        onTitleClick={header.onTitleClick}
        titleActionLabel={header.titleActionLabel}
        prevLabel={header.prevLabel}
        nextLabel={header.nextLabel}
      />
      {view === 'days' ? (
        <div
          ref={gridRef}
          className='_patro_grid'
          role='grid'
          tabIndex={0}
          aria-label={header.title}
          aria-activedescendant={cellId(idPrefix, activeAdDate)}
          onKeyDown={onGridKeyDown}
          onMouseDown={() => (pointerDown.current = true)}
          onMouseLeave={() => setHoverAdDate(undefined)}
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
            range={gridRange ?? undefined}
            onHoverDay={isRange ? setHoverAdDate : undefined}
          />
        </div>
      ) : (
        <CalendarPicker items={pickerItems} label={header.title} onPick={onPick} />
      )}
      {showTodayButton && (
        <div className='_patro_footer'>
          <button
            type='button'
            className='_patro_footer_today'
            disabled={!todayAllowed}
            onClick={goToToday}
          >
            {text.today}
          </button>
        </div>
      )}
    </div>
  );
};

// Overloads so `onChange` etc. are typed from `mode` even without strictNullChecks.
type CalendarOverloads = {
  (props: CalendarRangeProps): ReactElement;
  (props: CalendarSingleProps): ReactElement;
  (props: CalendarProps): ReactElement;
};

const Calendar = CalendarComponent as CalendarOverloads;

export { Calendar };
