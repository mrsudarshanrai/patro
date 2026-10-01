import { KeyboardEvent, ReactElement, useEffect, useId, useRef, useState } from 'react';
import { useCalendarData } from './hooks/useCalendarData';
import { useToday } from '../hooks/useToday';
import { useControllableValue } from '../hooks/useControllableValue';
import type {
  CalendarProps,
  CalendarRangeProps,
  CalendarSingleProps,
  PresetItem,
} from './CalendarType';
import {
  activeDay,
  DAY_STEPS,
  isValidRangeEnd,
  resolvePresets,
  shiftMonths,
  visibleMonths,
  YEARS_PER_PAGE,
} from './utils';
import { DateRange, RangeSelection, SingleSelection } from '../types/public';
import { CalendarGrid, cellId } from './components/CalendarGrid';
import CalendarHeader from './components/CalendarHeader';
import CalendarDays from './components/CalendarDays';
import { CalendarPicker, PickerView } from './components/CalendarPicker';
import {
  adDateToLocalDate,
  addDays,
  datePartsIn,
  DisplayOptions,
  formatNumber,
  getMonthGrid,
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
  EMPTY_RANGE,
} from '../utils';

const CalendarComponent = (props: CalendarProps) => {
  const {
    value,
    defaultValue,
    onChange,
    calendar = 'AD',
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
    dayContent,
    dayLabel,
    onMonthChange,
    month,
    defaultMonth,
    showTodayButton = false,
    today,
    labels,
    autoFocus = false,
    numberOfMonths = 1,
    className,
    style,
  } = props;
  const isRange = props.mode === 'range';
  const { minDays, maxDays, excludeDisabled } = isRange ? (props as CalendarRangeProps) : {};
  const [currentValue, setValue] = useControllableValue<Date | DateRange | null>(value, () =>
    defaultValue !== undefined ? defaultValue : isRange ? EMPTY_RANGE : null,
  );
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
  const gridRefs = useRef<(HTMLDivElement | null)[]>([]);
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
    defaultMonth,
    month,
    onMonthChange,
  });

  useEffect(() => setView('days'), [calendar]);

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

  const monthCount = Math.max(1, Math.floor(numberOfMonths));
  const multi = monthCount > 1;
  const months = visibleMonths(
    calendar,
    { first: firstAdDate, last: lastAdDate, dates },
    monthCount,
    (anchor) =>
      getMonthGrid(calendar, anchor, selectedAdDate, isDayDisabled, {
        weekStartsOn,
        fixedWeeks,
        weekendDays,
        today: todayAdDate,
      }),
  );
  const visibleStart = months[0].first;
  const visibleEnd = months[months.length - 1].last;

  const { adDate: activeAdDate, index: activeMonth } = activeDay(
    months,
    [focusedAdDate, selectedAdDate, todayAdDate],
    isDayDisabled,
  );

  // preventScroll: a popover may not be positioned yet on its first frame.
  useEffect(() => {
    if (autoFocus) gridRefs.current[activeMonth]?.focus({ preventScroll: true });
    // Only on mount / when autoFocus turns on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFocus]);

  // Keyboard focus moving into another visible month moves DOM focus to that month's grid.
  useEffect(() => {
    const grids = gridRefs.current;
    const focusedGrid = grids.find((grid) => grid && grid === document.activeElement);
    if (focusedGrid && focusedGrid !== grids[activeMonth]) {
      grids[activeMonth]?.focus({ preventScroll: true });
    }
  }, [activeMonth]);

  const isValidEnd = (start: string, end: string) =>
    isValidRangeEnd(start, end, { minDays, maxDays, excludeDisabled, isDayDisabled });

  const commitRange = (start: string, end: string | null) => {
    setValue({ start: adDateToLocalDate(start), end: end ? adDateToLocalDate(end) : null });
    (onChange as RangeSelection['onChange'])?.({
      start: toPatroDate(start),
      end: end ? toPatroDate(end) : null,
    });
  };

  const commitDay = (adDate: string) => {
    const selected = toPatroDate(adDate);
    setValue(selected.date);
    (onChange as SingleSelection['onChange'])?.(selected);
  };

  const onSelect = (adDate: string) => {
    setFocusedAdDate(adDate);
    if (!range) return commitDay(adDate);
    const restart = !range.start || !!range.end || !isValidEnd(range.start, adDate);
    commitRange(restart ? adDate : (range.start as string), restart ? null : adDate);
  };

  const presets = resolvePresets(props.presets, {
    range,
    selectedAdDate,
    isDayDisabled,
    isValidEnd,
  });

  const pickPreset = (preset: PresetItem) => {
    if (preset.disabled || !preset.start) return;
    const [year, month] = datePartsIn(preset.start, calendar);
    goToMonth(year, month);
    setView('days');
    setFocusedAdDate(preset.start);
    if (range) commitRange(preset.start, preset.end);
    else commitDay(preset.start);
  };

  const previewEnd =
    range?.start && !range.end
      ? (hoverAdDate ?? (showFocusRing ? activeAdDate : undefined))
      : undefined;
  const gridRange = range && {
    ...range,
    preview:
      previewEnd && range.start && isValidEnd(range.start, previewEnd) ? previewEnd : undefined,
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

  // Scroll only when the day is outside the visible months: onto the first, or the last.
  const moveFocus = (adDate: string | null) => {
    setShowFocusRing(true);
    if (!adDate || adDate < minAdDate || adDate > maxAdDate) return;
    const [year, month] = datePartsIn(adDate, calendar);
    if (adDate < visibleStart) goToMonth(year, month);
    else if (adDate > visibleEnd) {
      const index = year * 12 + month - 1 - (months.length - 1);
      goToMonth(Math.floor(index / 12), (index % 12) + 1);
    }
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
      const next = shiftMonths(activeAdDate, months, calendar);
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
      className={['_patro_container _patro', multi && '_patro_container_multi', className]
        .filter(Boolean)
        .join(' ')}
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
      <div className='_patro_months'>
        {months.map((month, index) => {
          const isFirst = index === 0;
          const isLast = index === months.length - 1;
          const title = isFirst ? header.title : monthTitle(month.first, calendar, display);
          const hasActive = index === activeMonth;
          return (
            // Keyed by position: a month change must not remount the focused grid.
            <div className='_patro_month' key={index}>
              <CalendarHeader
                nextMonth={header.next}
                prevMonth={header.prev}
                canNextMonth={header.canNext}
                canPrevMonth={header.canPrev}
                // Arrows on the outer months only; the first month's title opens the pickers.
                showPrev={isFirst}
                showNext={view === 'days' ? isLast : isFirst}
                title={title}
                subtitle={
                  isFirst ? header.subtitle : monthRange(month.first, month.last, calendar, display)
                }
                onTitleClick={isFirst ? header.onTitleClick : undefined}
                titleActionLabel={isFirst ? header.titleActionLabel : undefined}
                prevLabel={header.prevLabel}
                nextLabel={header.nextLabel}
              />
              {isFirst && view !== 'days' ? (
                <CalendarPicker items={pickerItems} label={header.title} onPick={onPick} />
              ) : (
                <div
                  ref={(node) => {
                    gridRefs.current[index] = node;
                  }}
                  className='_patro_grid'
                  role='grid'
                  // One Tab stop across all months: the grid holding the active day.
                  tabIndex={hasActive ? 0 : -1}
                  aria-label={title}
                  aria-activedescendant={hasActive ? cellId(idPrefix, activeAdDate) : undefined}
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
                    dates={month.dates}
                    calendar={calendar}
                    display={display}
                    onSelect={onSelect}
                    showSecondaryDate={showSecondaryDate}
                    idPrefix={idPrefix}
                    dayClassName={dayClassName}
                    dayContent={dayContent}
                    dayLabel={dayLabel}
                    focusedAdDate={showFocusRing ? activeAdDate : undefined}
                    range={gridRange ?? undefined}
                    onHoverDay={isRange ? setHoverAdDate : undefined}
                    hideOutsideDays={multi}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {presets.length > 0 && (
        <div className='_patro_presets' role='group' aria-label={text.presets}>
          {presets.map((preset) => (
            <button
              key={preset.label}
              type='button'
              className='_patro_presets_item'
              aria-pressed={preset.pressed}
              disabled={preset.disabled}
              onClick={() => pickPreset(preset)}
            >
              {preset.label}
            </button>
          ))}
        </div>
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
