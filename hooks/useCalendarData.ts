import { useState, useEffect, useCallback, useMemo } from 'react';

import { IUseCalendarData } from '../types/IHooks/IUseCalendarData';
import {
  createDateString,
  dateString2Obj,
  getHeaderMonths,
  getToday,
  switchYear,
  ad2Bs,
} from '../utils';
import { getRawAdDates } from '../utils/ad_utils';
import { bs2Ad, getRawBsDates } from '../utils/bs_utils';
import { ICalendar } from '../Calendar/types';

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
  if (calendarType === ICalendar.CalendarTypeEnum.BS) {
    const { year: bsYear, month: bsMonth } = dateString2Obj(
      ad2Bs(createDateString(year, month, date)),
    );
    return bs2Ad(createDateString(bsYear, bsMonth, 1));
  }
  return createDateString(year, month, 1);
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
  if (calendarType === ICalendar.CalendarTypeEnum.BS) {
    const { year, month } = dateString2Obj(ad2Bs(viewAnchor));
    const stepped = switchYear(year, month + step);
    return bs2Ad(createDateString(stepped.year, stepped.month, 1));
  }
  const { year, month } = dateString2Obj(viewAnchor);
  const stepped = switchYear(year, month + step);
  return createDateString(stepped.year, stepped.month, 1);
};

const useCalendarData = (
  calendarType: ICalendar.calendarType,
  defaultDate?: Date,
): IUseCalendarData.IReturn => {
  // The AD date (pinned to day 1 of whichever month navigation last landed
  // on, in whichever calendar system) currently on screen. Everything else
  // - the AD year/month, the BS year/month, both grids - derives from this
  // single value, so there's no stale day-of-month left over from a longer
  // month to build an invalid date string with after navigating.
  const [viewAnchor, setViewAnchor] = useState(() => {
    const { year, month, date } = getToday();
    return getViewAnchor(calendarType, year, month, date);
  });
  /** the day the "current/selected" highlight should land on, in AD terms */
  const [selected, setSelected] = useState<IUseCalendarData.ICurrDate>(getToday);

  useEffect(() => {
    if (defaultDate && 'getMonth' in defaultDate) {
      const month = defaultDate.getMonth() + 1;
      const year = defaultDate.getFullYear();
      const date = defaultDate.getDate();
      setViewAnchor(getViewAnchor(calendarType, year, month, date));
      setSelected({ year, month, date });
    } else {
      setViewAnchor(getViewAnchor(calendarType, selected.year, selected.month, selected.date));
    }
  }, [defaultDate?.getTime(), calendarType]);

  const { year: adYear, month: adMonth } = useMemo(() => dateString2Obj(viewAnchor), [viewAnchor]);
  const bsAnchor = useMemo(() => ad2Bs(viewAnchor), [viewAnchor]);
  const { year: bsYear } = useMemo(() => dateString2Obj(bsAnchor), [bsAnchor]);

  const nextMonth = useCallback(() => {
    setViewAnchor((anchor) => stepViewAnchor(anchor, calendarType, 1));
  }, [calendarType]);

  const prevMonth = useCallback(() => {
    setViewAnchor((anchor) => stepViewAnchor(anchor, calendarType, -1));
  }, [calendarType]);

  const selectedAdDate = useMemo(
    () => createDateString(selected.year, selected.month, selected.date),
    [selected],
  );
  const selectedBsDate = useMemo(() => ad2Bs(selectedAdDate), [selectedAdDate]);
  const selectedBs = useMemo(() => {
    const { year, month, day } = dateString2Obj(selectedBsDate);
    return { year, month, date: day };
  }, [selectedBsDate]);

  /**
   * generate AD dates
   */
  const adDates = useMemo(
    () => getRawAdDates(adYear, adMonth, selected.date, selected),
    [adYear, adMonth, selected],
  );

  /**
   * generate BS dates
   */
  const bsDates = useMemo(
    () => getRawBsDates(bsAnchor, adYear, adMonth, selected.date, selected, selectedBs),
    [bsAnchor, adYear, adMonth, selected, selectedBs],
  );

  const dateObj = {
    adDate: selectedAdDate,
    bsDate: selectedBsDate,
    headerMonths: {
      ...getHeaderMonths(
        calendarType,
        bsAnchor.split('-')[1],
        adMonth,
        String(bsYear),
        String(adYear),
      ),
    },
  };

  const dates: IUseCalendarData.IDates[][] =
    calendarType === ICalendar.CalendarTypeEnum.AD ? adDates : bsDates;

  return [dates, dateObj, nextMonth, prevMonth];
};

export { useCalendarData, stepViewAnchor };
