import { useState, useEffect, useCallback, useMemo } from 'react';

import { IUseCalendarData } from '../types/IHooks/IUseCalendarData';
import {
  addDays,
  clampAdDate,
  createDateString,
  dateString2Obj,
  getHeaderMonths,
  getMonthGrid,
  getToday,
  isSupportedAdDate,
  monthBounds,
  switchYear,
  ad2Bs,
  bs2Ad,
} from '../utils';
import { ICalendar } from '../Calendar/types';
import { MAX_AD_DATE, MIN_BS_YEAR, START_ENGLISH_DATE } from '../constants/dateConstants';

/**
 * AD date (pinned to day 1 of whichever calendar system is displayed) to
 * anchor the view on for a given AD year/month/date - day 1 of the AD month
 * in AD mode, or the AD date of day 1 of the containing BS month in BS mode.
 * Pinning to the AD month's day 1 in BS mode would land on the wrong BS
 * month whenever the BS month boundary falls after day 1 of the AD month.
 */
const getViewAnchor = (
  calendarType: ICalendar.calendarType,
  year: number,
  month: number,
  date: number,
): string => {
  const adDate = clampAdDate(createDateString(year, month, date));
  if (calendarType === ICalendar.CalendarTypeEnum.BS) {
    const { year: bsYear, month: bsMonth } = dateString2Obj(ad2Bs(adDate));
    return bs2Ad(createDateString(bsYear, bsMonth, 1));
  }
  const clamped = dateString2Obj(adDate);
  return createDateString(clamped.year, clamped.month, 1);
};

// Whether the neighbouring month has any day inside the supported table range.
const canStep = (viewAnchor: string, calendarType: ICalendar.calendarType, step: 1 | -1) => {
  const [first, last] = monthBounds(calendarType, viewAnchor);
  return step < 0 ? addDays(first, -1) >= START_ENGLISH_DATE : addDays(last, 1) <= MAX_AD_DATE;
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
): string => {
  if (!canStep(viewAnchor, calendarType, step)) return viewAnchor;
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

const useCalendarData = (
  calendarType: ICalendar.calendarType,
  defaultDate?: Date | null,
): IUseCalendarData.IReturn => {
  const [selected, setSelected] = useState<IUseCalendarData.ICurrDate | null>(() =>
    defaultDate === null ? null : toSelection(defaultDate ?? new Date()),
  );
  // Every other date value derives from this AD date, pinned to day 1 of the displayed month.
  const [viewAnchor, setViewAnchor] = useState(() => {
    const { year, month, date } = defaultDate ? ymd(defaultDate) : (selected ?? getToday());
    return getViewAnchor(calendarType, year, month, date);
  });

  const defaultTime = defaultDate?.getTime();
  const cleared = defaultDate === null;
  useEffect(() => {
    const requested = defaultTime !== undefined ? new Date(defaultTime) : undefined;
    const next = requested ? toSelection(requested) : cleared ? null : selected;
    const { year, month, date } = requested ? ymd(requested) : (next ?? getToday());
    setViewAnchor(getViewAnchor(calendarType, year, month, date));
    setSelected((prev) => (isSameDay(prev, next) ? prev : next));
  }, [defaultTime, cleared, calendarType, selected]);

  const { year: adYear, month: adMonth } = useMemo(() => dateString2Obj(viewAnchor), [viewAnchor]);
  // Only AD April 1921 starts before the table; its 1st falls in BS 1977 Chaitra.
  const bsAnchor = useMemo(
    () =>
      viewAnchor < START_ENGLISH_DATE
        ? createDateString(MIN_BS_YEAR - 1, 12, 1)
        : ad2Bs(viewAnchor),
    [viewAnchor],
  );
  const { year: bsYear } = useMemo(() => dateString2Obj(bsAnchor), [bsAnchor]);

  const nextMonth = useCallback(() => {
    setViewAnchor((anchor) => stepViewAnchor(anchor, calendarType, 1));
  }, [calendarType]);

  const prevMonth = useCallback(() => {
    setViewAnchor((anchor) => stepViewAnchor(anchor, calendarType, -1));
  }, [calendarType]);

  const selectedAdDate = useMemo(
    () => (selected ? createDateString(selected.year, selected.month, selected.date) : null),
    [selected],
  );
  const selectedBsDate = useMemo(
    () => (selectedAdDate ? ad2Bs(selectedAdDate) : null),
    [selectedAdDate],
  );
  const dates = useMemo(
    () => getMonthGrid(calendarType, viewAnchor, selectedAdDate),
    [calendarType, viewAnchor, selectedAdDate],
  );

  return {
    dates,
    adDate: selectedAdDate,
    bsDate: selectedBsDate,
    header: getHeaderMonths(
      calendarType,
      bsAnchor.split('-')[1],
      adMonth,
      String(bsYear),
      String(adYear),
    ),
    nextMonth,
    prevMonth,
    canNextMonth: canStep(viewAnchor, calendarType, 1),
    canPrevMonth: canStep(viewAnchor, calendarType, -1),
  };
};

export { useCalendarData, stepViewAnchor };
