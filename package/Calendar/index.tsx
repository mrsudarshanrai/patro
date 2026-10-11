import { ReactElement, useCallback, useEffect, useId, useRef, useState } from 'react';
import { useClaimEscape } from '../hooks/useClaimEscape';
import { useToday } from '../hooks/useToday';
import {
  datePartsIn,
  DisplayOptions,
  getMonthGrid,
  isSupportedAdDate,
  labelsFor,
  languageOf,
  monthRange,
  monthTitle,
} from '../utils';
import type {
  CalendarProps,
  CalendarRangeProps,
  CalendarSingleProps,
  PresetItem,
} from './CalendarType';
import { useCalendarData } from './hooks/useCalendarData';
import { useCalendarValue } from './hooks/useCalendarValue';
import { useGridFocus } from './hooks/useGridFocus';
import { usePickerView } from './hooks/usePickerView';
import { isValidRangeEnd, resolvePresets, visibleMonths } from './utils';
import { CalendarMonth } from './components/CalendarMonth';
import { CalendarPresets } from './components/CalendarPresets';
import { TodayButton } from './components/TodayButton';

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
  const { range, selectedDate, commitDay, commitRange } = useCalendarValue({
    isRange,
    value,
    defaultValue,
    onChange,
  });
  const [hoverAdDate, setHoverAdDate] = useState<string>();
  const idPrefix = useId();
  const todayAdDate = useToday(today);
  const display: DisplayOptions = { locale, numerals };
  const text = labelsFor(calendar, display, labels);

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

  const { view, setView, header, pickerItems, onPick } = usePickerView({
    calendar,
    display,
    text,
    firstAdDate,
    lastAdDate,
    minAdDate,
    maxAdDate,
    prevMonth,
    nextMonth,
    canPrevMonth,
    canNextMonth,
    goToMonth,
  });

  const rootRef = useRef<HTMLDivElement>(null);
  const containsNode = useCallback((node: Node) => !!rootRef.current?.contains(node), []);
  useClaimEscape(view !== 'days', containsNode);

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

  const isValidEnd = (start: string, end: string) =>
    isValidRangeEnd(start, end, { minDays, maxDays, excludeDisabled, isDayDisabled });

  const { activeAdDate, setFocusedAdDate, showFocusRing, gridProps, focusGrid } = useGridFocus({
    calendar,
    months,
    selectedAdDate,
    todayAdDate,
    isDayDisabled,
    minAdDate,
    maxAdDate,
    goToMonth,
    weekStartsOn,
    autoFocus,
    idPrefix,
    onSelect: (adDate) => onSelect(adDate),
  });

  const pendingFocus = useRef<{ fromKeyboard: boolean }>(null);
  const changeViewKeepingFocus = (fromKeyboard: boolean, change: () => void) => {
    pendingFocus.current = { fromKeyboard };
    change();
  };
  useEffect(() => {
    if (!pendingFocus.current) return;
    const { fromKeyboard } = pendingFocus.current;
    pendingFocus.current = null;
    if (view === 'days') focusGrid(fromKeyboard);
    else rootRef.current?.querySelector<HTMLElement>('._patro_picker [tabindex="0"]')?.focus();
  });

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

  const todayAllowed =
    !!todayAdDate && isSupportedAdDate(todayAdDate) && !isDayDisabled(todayAdDate);
  const goToToday = () => {
    if (!todayAdDate) return;
    const [year, month] = datePartsIn(todayAdDate, calendar);
    goToMonth(year, month);
    setView('days');
    onSelect(todayAdDate);
  };

  return (
    <div
      ref={rootRef}
      className={['_patro_container _patro', multi && '_patro_container_multi', className]
        .filter(Boolean)
        .join(' ')}
      style={style}
      lang={languageOf(calendar, display)}
      data-calendar-type={calendar}
      data-theme={theme}
      // Month unknown until the browser's today is (server render / hydration); CSS hides the placeholder.
      aria-busy={pending || undefined}
      onKeyDown={(event) => {
        if (view === 'days' || event.key !== 'Escape') return;
        event.stopPropagation();
        changeViewKeepingFocus(true, () => setView('days'));
      }}
    >
      <div className='_patro_months'>
        {months.map((visible, index) => {
          const isFirst = index === 0;
          return (
            // Keyed by position: a month change must not remount the focused grid.
            <CalendarMonth
              key={index}
              header={header}
              title={isFirst ? header.title : monthTitle(visible.first, calendar, display)}
              subtitle={
                isFirst
                  ? header.subtitle
                  : monthRange(visible.first, visible.last, calendar, display)
              }
              isFirst={isFirst}
              isLast={index === months.length - 1}
              view={view}
              pickerItems={pickerItems}
              onPick={(value, fromKeyboard) =>
                changeViewKeepingFocus(fromKeyboard, () => onPick(value))
              }
              grid={gridProps(index)}
              weekdays={{ calendar, display, weekStartsOn, weekendDays }}
              days={{
                dates: visible.dates,
                calendar,
                display,
                onSelect,
                showSecondaryDate,
                idPrefix,
                dayClassName,
                dayContent,
                dayLabel,
                focusedAdDate: showFocusRing ? activeAdDate : undefined,
                range: gridRange ?? undefined,
                onHoverDay: isRange ? setHoverAdDate : undefined,
                hideOutsideDays: multi,
              }}
              onMouseLeave={() => setHoverAdDate(undefined)}
            />
          );
        })}
      </div>
      {presets.length > 0 && (
        <CalendarPresets items={presets} label={text.presets} onPick={pickPreset} />
      )}
      {showTodayButton && (
        <TodayButton label={text.today} disabled={!todayAllowed} onClick={goToToday} />
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
