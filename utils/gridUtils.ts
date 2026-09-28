import { ICalendar } from '../Calendar/types';
import { dates as bsTable, weeksDaysCount } from '../constants/dateConstants';
import { IUseCalendarData } from '../types/IHooks/IUseCalendarData';
import {
  addDays,
  createDateString,
  dateString2Obj,
  getDates,
  isSupportedAdDate,
  isTodayAdDate,
} from './dateUtils';
import { ad2Bs } from './ad_utils/ad2bs';
import { bs2Ad } from './bs_utils/bs2ad';

const weekday = (adDate: string) => {
  const { year, month, day } = dateString2Obj(adDate);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
};

// First and last AD dates of the month containing `adDate`, in the given calendar.
const monthBounds = (calendarType: ICalendar.calendarType, adDate: string) => {
  if (calendarType === ICalendar.CalendarTypeEnum.AD) {
    const { year, month } = dateString2Obj(adDate);
    return [createDateString(year, month, 1), createDateString(year, month, getDates(month, year))];
  }
  const { year, month } = dateString2Obj(ad2Bs(adDate));
  return [
    bs2Ad(createDateString(year, month, 1)),
    bs2Ad(createDateString(year, month, bsTable[year][month])),
  ];
};

const chunk = <T>(items: T[], size: number) =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, i) =>
    items.slice(i * size, (i + 1) * size),
  );

// Week rows for the month containing `adDate`, padded with the neighbouring months' days.
// `fixedWeeks` always renders 6 rows so the calendar keeps one height.
const getMonthGrid = (
  calendarType: ICalendar.calendarType,
  adDate: string,
  selectedAdDate: string | null,
  isDayDisabled?: (adDate: string) => boolean,
  { weekStartsOn = 0, fixedWeeks = true }: { weekStartsOn?: number; fixedWeeks?: boolean } = {},
): IUseCalendarData.IDates[][] => {
  const isAdView = calendarType === ICalendar.CalendarTypeEnum.AD;
  const [first, last] = monthBounds(calendarType, adDate);
  const column = (day: string) => (weekday(day) - weekStartsOn + weeksDaysCount) % weeksDaysCount;
  const start = addDays(first, -column(first));
  const end = fixedWeeks
    ? addDays(start, 6 * weeksDaysCount - 1)
    : addDays(last, weeksDaysCount - 1 - column(last));

  const cells: IUseCalendarData.IDates[] = [];
  for (let ad = start; ad <= end; ad = addDays(ad, 1)) {
    const offset = ad < first ? 'prev' : ad > last ? 'next' : undefined;
    const [adYear, adMonth, adDay] = ad.split('-');
    if (!isSupportedAdDate(ad)) {
      cells.push({
        day: isAdView ? Number(adDay) : null,
        secondaryDay: null,
        year: isAdView ? Number(adYear) : 0,
        month: isAdView ? Number(adMonth) : 0,
        adDate: ad,
        isToday: false,
        isSelected: false,
        isDisabled: true,
        ...(offset && { offset }),
      });
      continue;
    }
    const [bsYear, bsMonth, bsDay] = ad2Bs(ad).split('-');
    cells.push({
      day: Number(isAdView ? adDay : bsDay),
      secondaryDay: Number(isAdView ? bsDay : adDay),
      year: Number(isAdView ? adYear : bsYear),
      month: Number(isAdView ? adMonth : bsMonth),
      adDate: ad,
      isToday: isTodayAdDate(ad),
      isSelected: !offset && ad === selectedAdDate,
      ...(isDayDisabled?.(ad) && { isDisabled: true }),
      ...(offset && { offset }),
    });
  }
  return chunk(cells, weeksDaysCount);
};

export { getMonthGrid, monthBounds };
