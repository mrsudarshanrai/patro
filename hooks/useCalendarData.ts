import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

import {
  addDays,
  clampAdDate,
  createDateString,
  dateString2Obj,
  getMonthGrid,
  getToday,
  isSupportedAdDate,
  monthBounds,
  monthSpan,
  overlaps,
  switchYear,
  toAdDateString,
  toPatroDate,
  ad2Bs,
  bs2Ad,
} from '../utils';
import type { DayParts, UseCalendarDataResult } from '../Calendar/CalendarType';
import type { CalendarSystem, PatroDate } from '../types/public';
import { MAX_AD_DATE, START_ENGLISH_DATE } from '../constants/dateConstants';

/**
 * AD date (pinned to day 1 of whichever calendar system is displayed) to
 * anchor the view on for a given AD year/month/date - day 1 of the AD month
 * in AD mode, or the AD date of day 1 of the containing BS month in BS mode.
 * Pinning to the AD month's day 1 in BS mode would land on the wrong BS
 * month whenever the BS month boundary falls after day 1 of the AD month.
 */
type Bounds = { min: string; max: string };
const FULL_RANGE: Bounds = { min: START_ENGLISH_DATE, max: MAX_AD_DATE };

const getViewAnchor = (
  calendarType: CalendarSystem,
  year: number,
  month: number,
  date: number,
  bounds: Bounds = FULL_RANGE,
): string => {
  const adDate = clampAdDate(createDateString(year, month, date), bounds.min, bounds.max);
  if (calendarType === 'BS') {
    const { year: bsYear, month: bsMonth } = dateString2Obj(ad2Bs(adDate));
    return bs2Ad(createDateString(bsYear, bsMonth, 1));
  }
  const clamped = dateString2Obj(adDate);
  return createDateString(clamped.year, clamped.month, 1);
};

// Whether the neighbouring month has any day inside the bounds.
const canStep = (
  viewAnchor: string,
  calendarType: CalendarSystem,
  step: 1 | -1,
  bounds: Bounds = FULL_RANGE,
) => {
  const [first, last] = monthBounds(calendarType, viewAnchor);
  return step < 0 ? addDays(first, -1) >= bounds.min : addDays(last, 1) <= bounds.max;
};

/**
 * Given the AD date (pinned to day 1) a calendar view is anchored on, returns
 * the anchor for one month forward/back (`step` = 1 or -1) in whichever
 * calendar system is currently displayed - stepping by a true BS month in BS
 * mode (via the BS year table, through switchYear) rather than by one AD
 * month and re-deriving BS from that, which doesn't reliably move exactly
 * one BS month since BS months run 29-32 days against AD's 28-31.
 */
const stepViewAnchor = (
  viewAnchor: string,
  calendarType: CalendarSystem,
  step: 1 | -1,
  bounds: Bounds = FULL_RANGE,
): string => {
  if (!canStep(viewAnchor, calendarType, step, bounds)) return viewAnchor;
  if (calendarType === 'BS') {
    const { year, month } = dateString2Obj(ad2Bs(viewAnchor));
    const stepped = switchYear(year, month + step);
    return bs2Ad(createDateString(stepped.year, stepped.month, 1));
  }
  const { year, month } = dateString2Obj(viewAnchor);
  const stepped = switchYear(year, month + step);
  return createDateString(stepped.year, stepped.month, 1);
};

// Dates outside the supported table range can't be shown, so they count as no selection.
const ymd = (date: Date): DayParts => ({
  year: date.getFullYear(),
  month: date.getMonth() + 1,
  date: date.getDate(),
});

const toSelection = (date: Date): DayParts | null => {
  const selection = ymd(date);
  const adDate = createDateString(selection.year, selection.month, selection.date);
  return isSupportedAdDate(adDate) ? selection : null;
};

const isSameDay = (a: DayParts | null, b: DayParts | null) =>
  a === b || (!!a && !!b && a.year === b.year && a.month === b.month && a.date === b.date);

type Options = {
  minDate?: Date;
  maxDate?: Date;
  isDateDisabled?: (date: PatroDate) => boolean;
  weekStartsOn?: number;
  fixedWeeks?: boolean;
  weekendDays?: number[];
  /** Today's AD date; null while it isn't known yet (server rendering, hydration). */
  today?: string | null;
  /** Month shown when nothing is selected, instead of today's. */
  defaultMonth?: Date;
  /** Controlled month: navigation calls `onNavigate` instead of moving the view. */
  month?: Date;
  onNavigate?: (anchor: string) => void;
};

// Placeholder month while neither a selection nor today is known; the calendar hides it.
const PENDING_ANCHOR = { year: 2000, month: 1, date: 1 };

const todayParts = (today: string | null) => {
  if (!today) return getToday();
  const { year, month, day } = dateString2Obj(today);
  return { year, month, date: day };
};

const useCalendarData = (
  calendarType: CalendarSystem,
  selectedDate?: Date | null,
  {
    minDate,
    maxDate,
    isDateDisabled,
    weekStartsOn,
    fixedWeeks,
    weekendDays,
    today = null,
    defaultMonth,
    month,
    onNavigate,
  }: Options = {},
): UseCalendarDataResult => {
  const minAdDate = minDate ? clampAdDate(toAdDateString(minDate)) : START_ENGLISH_DATE;
  const maxAdDate = maxDate ? clampAdDate(toAdDateString(maxDate)) : MAX_AD_DATE;
  const bounds = useMemo(() => ({ min: minAdDate, max: maxAdDate }), [minAdDate, maxAdDate]);

  const [selected, setSelected] = useState<DayParts | null>(() =>
    selectedDate ? toSelection(selectedDate) : null,
  );
  // Every other date value derives from this AD date, pinned to day 1 of the displayed month.
  // null until there's a selection or a known today to anchor on.
  const [viewAnchor, setViewAnchor] = useState<string | null>(() => {
    const fallback = defaultMonth ? ymd(defaultMonth) : today && todayParts(today);
    if (!selectedDate && !fallback) return null;
    const { year, month, date } = selectedDate ? ymd(selectedDate) : fallback;
    return getViewAnchor(calendarType, year, month, date, bounds);
  });
  const controlledAnchor = month
    ? getViewAnchor(
        calendarType,
        month.getFullYear(),
        month.getMonth() + 1,
        month.getDate(),
        bounds,
      )
    : null;
  const shownAnchor =
    controlledAnchor ??
    viewAnchor ??
    getViewAnchor(
      calendarType,
      PENDING_ANCHOR.year,
      PENDING_ANCHOR.month,
      PENDING_ANCHOR.date,
      bounds,
    );

  // A ref so today moving on at midnight doesn't pull the view away from where the user is.
  const todayRef = useRef(today);
  useEffect(() => {
    todayRef.current = today;
  });

  const selectedTime = selectedDate?.getTime();
  const defaultMonthTime = defaultMonth?.getTime();
  useEffect(() => {
    const requested = selectedTime !== undefined ? new Date(selectedTime) : undefined;
    const next = requested ? toSelection(requested) : null;
    // Effects only run in the browser, so the clock here is the visitor's.
    const fallback =
      defaultMonthTime !== undefined
        ? ymd(new Date(defaultMonthTime))
        : todayParts(todayRef.current);
    const { year, month, date } = requested ? ymd(requested) : fallback;
    setViewAnchor(getViewAnchor(calendarType, year, month, date, bounds));
    setSelected((prev) => (isSameDay(prev, next) ? prev : next));
  }, [selectedTime, defaultMonthTime, calendarType, bounds]);

  // Controlled: ask the owner to move; uncontrolled: move.
  const navigate = useCallback(
    (anchor: string) => {
      if (!controlledAnchor) setViewAnchor(anchor);
      else if (anchor !== controlledAnchor) onNavigate?.(anchor);
    },
    [controlledAnchor, onNavigate],
  );

  const [firstAdDate, lastAdDate] = useMemo(
    () => monthBounds(calendarType, shownAnchor),
    [calendarType, shownAnchor],
  );

  const pending = !controlledAnchor && !viewAnchor;

  const nextMonth = useCallback(() => {
    if (!pending) navigate(stepViewAnchor(shownAnchor, calendarType, 1, bounds));
  }, [pending, navigate, shownAnchor, calendarType, bounds]);

  const prevMonth = useCallback(() => {
    if (!pending) navigate(stepViewAnchor(shownAnchor, calendarType, -1, bounds));
  }, [pending, navigate, shownAnchor, calendarType, bounds]);

  const goToMonth = useCallback(
    (year: number, month: number) => {
      const span = monthSpan(calendarType, year, month);
      if (span && overlaps(span, bounds.min, bounds.max)) navigate(span[0]);
    },
    [navigate, calendarType, bounds],
  );

  const isDayDisabled = useCallback(
    (adDate: string) =>
      adDate < minAdDate ||
      adDate > maxAdDate ||
      (!!isDateDisabled && isDateDisabled(toPatroDate(adDate))),
    [minAdDate, maxAdDate, isDateDisabled],
  );

  const selectedAdDate = useMemo(
    () => (selected ? createDateString(selected.year, selected.month, selected.date) : null),
    [selected],
  );
  const selectedBsDate = useMemo(
    () => (selectedAdDate ? ad2Bs(selectedAdDate) : null),
    [selectedAdDate],
  );
  // weekendDays is usually an inline array, so key the memo on its contents.
  const weekendKey = weekendDays?.join(',') ?? '';
  const weekend = useMemo(
    () => (weekendKey ? weekendKey.split(',').map(Number) : []),
    [weekendKey],
  );
  const dates = useMemo(
    () =>
      getMonthGrid(calendarType, shownAnchor, selectedAdDate, isDayDisabled, {
        weekStartsOn,
        fixedWeeks,
        weekendDays: weekend,
        today,
      }),
    [
      calendarType,
      shownAnchor,
      selectedAdDate,
      isDayDisabled,
      weekStartsOn,
      fixedWeeks,
      weekend,
      today,
    ],
  );

  return {
    dates,
    adDate: selectedAdDate,
    bsDate: selectedBsDate,
    firstAdDate,
    lastAdDate,
    nextMonth,
    prevMonth,
    goToMonth,
    canNextMonth: !pending && canStep(shownAnchor, calendarType, 1, bounds),
    canPrevMonth: !pending && canStep(shownAnchor, calendarType, -1, bounds),
    pending,
    minAdDate,
    maxAdDate,
    isDayDisabled,
  };
};

export { useCalendarData, stepViewAnchor };
