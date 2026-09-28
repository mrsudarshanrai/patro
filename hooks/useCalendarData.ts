import { useState, useEffect, useCallback, useMemo } from 'react';

import { IUseCalendarData } from '../types/IHooks/IUseCalendarData';
import {
  addDays,
  clampAdDate,
  createDateString,
  dateString2Obj,
  getMonthGrid,
  getToday,
  isSupportedAdDate,
  monthBounds,
  switchYear,
  toAdDateString,
  toPatroDate,
  ad2Bs,
  bs2Ad,
} from '../utils';
import { ICalendar } from '../Calendar/types';
import { PatroDate } from '../types/public';
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
  calendarType: ICalendar.calendarType,
  year: number,
  month: number,
  date: number,
  bounds: Bounds = FULL_RANGE,
): string => {
  const adDate = clampAdDate(createDateString(year, month, date), bounds.min, bounds.max);
  if (calendarType === ICalendar.CalendarTypeEnum.BS) {
    const { year: bsYear, month: bsMonth } = dateString2Obj(ad2Bs(adDate));
    return bs2Ad(createDateString(bsYear, bsMonth, 1));
  }
  const clamped = dateString2Obj(adDate);
  return createDateString(clamped.year, clamped.month, 1);
};

// Whether the neighbouring month has any day inside the bounds.
const canStep = (
  viewAnchor: string,
  calendarType: ICalendar.calendarType,
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
  calendarType: ICalendar.calendarType,
  step: 1 | -1,
  bounds: Bounds = FULL_RANGE,
): string => {
  if (!canStep(viewAnchor, calendarType, step, bounds)) return viewAnchor;
  if (calendarType === ICalendar.CalendarTypeEnum.BS) {
    const { year, month } = dateString2Obj(ad2Bs(viewAnchor));
    const stepped = switchYear(year, month + step);
    return bs2Ad(createDateString(stepped.year, stepped.month, 1));
  }
  const { year, month } = dateString2Obj(viewAnchor);
  const stepped = switchYear(year, month + step);
  return createDateString(stepped.year, stepped.month, 1);
};

// Dates outside the supported table range can't be shown, so they count as no selection.
const ymd = (date: Date): IUseCalendarData.ICurrDate => ({
  year: date.getFullYear(),
  month: date.getMonth() + 1,
  date: date.getDate(),
});

const toSelection = (date: Date): IUseCalendarData.ICurrDate | null => {
  const selection = ymd(date);
  const adDate = createDateString(selection.year, selection.month, selection.date);
  return isSupportedAdDate(adDate) ? selection : null;
};

const isSameDay = (a: IUseCalendarData.ICurrDate | null, b: IUseCalendarData.ICurrDate | null) =>
  a === b || (!!a && !!b && a.year === b.year && a.month === b.month && a.date === b.date);

type Options = {
  minDate?: Date;
  maxDate?: Date;
  isDateDisabled?: (date: PatroDate) => boolean;
  weekStartsOn?: number;
  fixedWeeks?: boolean;
};

const useCalendarData = (
  calendarType: ICalendar.calendarType,
  selectedDate?: Date | null,
  { minDate, maxDate, isDateDisabled, weekStartsOn, fixedWeeks }: Options = {},
): IUseCalendarData.IReturn => {
  const minAdDate = minDate ? clampAdDate(toAdDateString(minDate)) : START_ENGLISH_DATE;
  const maxAdDate = maxDate ? clampAdDate(toAdDateString(maxDate)) : MAX_AD_DATE;
  const bounds = useMemo(() => ({ min: minAdDate, max: maxAdDate }), [minAdDate, maxAdDate]);

  const [selected, setSelected] = useState<IUseCalendarData.ICurrDate | null>(() =>
    selectedDate === null ? null : toSelection(selectedDate ?? new Date()),
  );
  // Every other date value derives from this AD date, pinned to day 1 of the displayed month.
  const [viewAnchor, setViewAnchor] = useState(() => {
    const { year, month, date } = selectedDate ? ymd(selectedDate) : (selected ?? getToday());
    return getViewAnchor(calendarType, year, month, date, bounds);
  });

  const selectedTime = selectedDate?.getTime();
  const cleared = selectedDate === null;
  useEffect(() => {
    const requested = selectedTime !== undefined ? new Date(selectedTime) : undefined;
    const next = requested ? toSelection(requested) : cleared ? null : selected;
    const { year, month, date } = requested ? ymd(requested) : (next ?? getToday());
    setViewAnchor(getViewAnchor(calendarType, year, month, date, bounds));
    setSelected((prev) => (isSameDay(prev, next) ? prev : next));
  }, [selectedTime, cleared, calendarType, selected, bounds]);

  const [firstAdDate, lastAdDate] = useMemo(
    () => monthBounds(calendarType, viewAnchor),
    [calendarType, viewAnchor],
  );

  const nextMonth = useCallback(() => {
    setViewAnchor((anchor) => stepViewAnchor(anchor, calendarType, 1, bounds));
  }, [calendarType, bounds]);

  const prevMonth = useCallback(() => {
    setViewAnchor((anchor) => stepViewAnchor(anchor, calendarType, -1, bounds));
  }, [calendarType, bounds]);

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
  const dates = useMemo(
    () =>
      getMonthGrid(calendarType, viewAnchor, selectedAdDate, isDayDisabled, {
        weekStartsOn,
        fixedWeeks,
      }),
    [calendarType, viewAnchor, selectedAdDate, isDayDisabled, weekStartsOn, fixedWeeks],
  );

  return {
    dates,
    adDate: selectedAdDate,
    bsDate: selectedBsDate,
    firstAdDate,
    lastAdDate,
    nextMonth,
    prevMonth,
    canNextMonth: canStep(viewAnchor, calendarType, 1, bounds),
    canPrevMonth: canStep(viewAnchor, calendarType, -1, bounds),
    minAdDate,
    maxAdDate,
    isDayDisabled,
  };
};

export { useCalendarData, stepViewAnchor };
