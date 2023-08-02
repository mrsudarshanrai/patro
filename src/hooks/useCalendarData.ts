import { useState, useEffect, useCallback, useMemo } from 'react';

import { MONTHS_IN_YEAR, currentDate, currentMonth, currentYear } from '../constants/dateConstants';
import { IUseCalendarData } from '../types/IHooks/IUseCalendarData';
import { createDateString, getHeaderMonths, ad2Bs } from '../utils';
import { getRawAdDates } from '../utils/ad_utils';
import { ICalendar } from '../types/ICalendar';
import { getRawBsDates } from '../utils/bs_utils';

const useCalendarData = (
  calendarType: ICalendar.calendarType,
  defaultDate?: Date,
): IUseCalendarData.IReturn => {
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);
  const [date, setDate] = useState(currentDate);
  /** preserve current date */
  const [currDate, setCurrDate] = useState<IUseCalendarData.ICurrDate>({
    month: currentMonth,
    year: currentYear,
    date: currentDate,
  });

  useEffect(() => {
    if (defaultDate && 'getMonth' in defaultDate) {
      setMonth(() => defaultDate.getMonth() + 1);
      setYear(() => defaultDate.getFullYear());
      setDate(() => defaultDate.getDate());
      setCurrDate({
        month: defaultDate.getMonth(),
        year: defaultDate.getFullYear(),
        date: defaultDate.getDate(),
      });
    }
  }, []);

  const nextMonth = useCallback(() => {
    if (month === MONTHS_IN_YEAR) {
      setYear((prevYear) => prevYear + 1);
      setMonth(() => 1);
    } else setMonth((prev) => prev + 1);
  }, [month]);

  const prevMonth = useCallback(() => {
    if (month <= 1) {
      setYear((prevYear) => prevYear - 1);
      setMonth(() => MONTHS_IN_YEAR);
    } else setMonth((prev) => prev - 1);
  }, [month]);

  const adDates = useMemo(() => getRawAdDates(year, month, date, currDate), [year, month, date]);
  const bsDate = useMemo(() => ad2Bs(createDateString(year, month, date)), [year, month, date]);
  const [bsYear, bsMonth] = bsDate.split('-');

  const dateObj = {
    adDate: createDateString(year, month, date),
    bsDate,
    headerMonths: {
      ...getHeaderMonths(calendarType, bsMonth, month, bsYear, String(year)),
    },
  };

  const bsDates = useMemo(
    () => getRawBsDates(bsDate, adDates, year, month, date, currDate),
    [bsDate, adDates, year, month, date, currDate],
  );

  const dates: IUseCalendarData.IDates[] = calendarType === 'BS' ? bsDates : adDates;

  return [dates, dateObj, nextMonth, prevMonth];
};

export { useCalendarData };
