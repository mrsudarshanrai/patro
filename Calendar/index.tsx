import { KeyboardEvent, ReactElement, useEffect, useId, useRef, useState } from 'react';
import { stepViewAnchor, useCalendarData } from '../hooks/useCalendarData';
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
  getMonthGrid,
  isSupportedAdDate,
  labelsFor,
  monthName,
  monthBounds,
  monthRange,
  monthSpan,
  monthTitle,
  overlaps,
  supportedAdDate,
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
  const gridRefs = useRef<(HTMLDivElement | null)[]>([]);
  const idPrefix = useId();
  const todayAdDate = useToday(today);

  // Latest callback in a ref so an inline onMonthChange doesn't refire the effect every render.
  const onMonthChangeRef = useRef(onMonthChange);
  useEffect(() => {
    onMonthChangeRef.current = onMonthChange;
  });
  const reportMonth = (first: string, last: string) =>
    onMonthChangeRef.current?.({
      start: toPatroDate(clampAdDate(first)),
      end: toPatroDate(clampAdDate(last)),
    });

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
    onNavigate: (anchor) => reportMonth(...(monthBounds(calendar, anchor) as [string, string])),
  });

  // Uncontrolled: report every month the view moves to. Controlled: onNavigate reports requests.
  const isMonthControlled = month !== undefined;
  const shownMonth = useRef(firstAdDate);
  useEffect(() => {
    if (shownMonth.current === firstAdDate) return;
    shownMonth.current = firstAdDate;
    if (!isMonthControlled) reportMonth(firstAdDate, lastAdDate);
  }, [firstAdDate, lastAdDate, isMonthControlled]);

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

  // The first month comes from the hook; with numberOfMonths, the next ones follow it.
  const monthCount = Math.max(1, Math.floor(numberOfMonths));
  const multi = monthCount > 1;
  const months = [{ first: firstAdDate, last: lastAdDate, dates }];
  for (let i = 1; i < monthCount; i++) {
    const anchor = stepViewAnchor(months[i - 1].first, calendar, 1);
    // No months past the end of the BS table.
    if (anchor === months[i - 1].first) break;
    const [first, last] = monthBounds(calendar, anchor);
    const grid = getMonthGrid(calendar, anchor, selectedAdDate, isDayDisabled, {
      weekStartsOn,
      fixedWeeks,
      weekendDays,
      today: todayAdDate,
    });
    months.push({ first, last, dates: grid });
  }
  const visibleStart = months[0].first;
  const visibleEnd = months[months.length - 1].last;

  const ownDays = months.flatMap((month) => month.dates.flat().filter((cell) => !cell.offset));
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

  const activeMonth = Math.max(
    0,
    months.findIndex((month) => activeAdDate >= month.first && activeAdDate <= month.last),
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

  const isValidEnd = (start: string, end: string) => {
    if (end < start) return false;
    const days = Math.round((Date.parse(end) - Date.parse(start)) / 86_400_000) + 1;
    if ((minDays && days < minDays) || (maxDays && days > maxDays)) return false;
    if (!excludeDisabled) return true;
    for (let day = start; day <= end; day = addDays(day, 1)) if (isDayDisabled(day)) return false;
    return true;
  };

  const commitRange = (start: string, end: string | null) => {
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
  };

  const commitDay = (adDate: string) => {
    const selected = toPatroDate(adDate);
    if (!isControlled) setUncontrolledValue(selected.date);
    (onChange as SingleSelection['onChange'])?.(selected);
  };

  const onSelect = (adDate: string) => {
    setFocusedAdDate(adDate);
    if (!range) return commitDay(adDate);
    const restart = !range.start || !!range.end || !isValidEnd(range.start, adDate);
    commitRange(restart ? adDate : (range.start as string), restart ? null : adDate);
  };

  // Presets resolve on every render so "Today"-style ones stay current and can be disabled.
  const presets = (props.presets ?? []).map(({ label, value }) => {
    const resolved = typeof value === 'function' ? value() : value;
    if (range) {
      const { start, end } = supportedAdRange(resolved as DateRange);
      const valid =
        !!start && !!end && !isDayDisabled(start) && !isDayDisabled(end) && isValidEnd(start, end);
      return {
        label,
        disabled: !valid,
        pressed: !!start && start === range.start && end === range.end,
        pick: () => start && commitRange(start, end),
        first: start,
      };
    }
    const adDate = supportedAdDate(resolved as Date);
    return {
      label,
      disabled: !adDate || isDayDisabled(adDate),
      pressed: !!adDate && adDate === selectedAdDate,
      pick: () => adDate && commitDay(adDate),
      first: adDate,
    };
  });

  const pickPreset = (preset: (typeof presets)[number]) => {
    if (preset.disabled || !preset.first) return;
    const [year, month] = datePartsIn(preset.first, calendar);
    goToMonth(year, month);
    setView('days');
    setFocusedAdDate(preset.first);
    preset.pick();
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

  // Same day `months` away in the displayed calendar, clamped to that month's length.
  const shiftMonths = (adDate: string, months: number) => {
    const [year, month, day] = datePartsIn(adDate, calendar);
    const index = year * 12 + month - 1 + months;
    const span = monthSpan(calendar, Math.floor(index / 12), (index % 12) + 1);
    if (!span) return null;
    const target = addDays(span[0], day - 1);
    return target > span[1] ? span[1] : target;
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
