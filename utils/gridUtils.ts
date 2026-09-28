import { ICalendar } from '../Calendar/types';
import { dates as bsTable, weeksDaysCount } from '../constants/dateConstants';
import { IUseCalendarData } from '../types/IHooks/IUseCalendarData';
import {
  addDays,
  createDateString,
  dateString2Obj,
  en2NpNumber,
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
const getMonthGrid = (
  calendarType: ICalendar.calendarType,
  adDate: string,
  selectedAdDate: string | null,
  isDayDisabled?: (adDate: string) => boolean,
): IUseCalendarData.IDates[][] => {
  const isAdView = calendarType === ICalendar.CalendarTypeEnum.AD;
  const [first, last] = monthBounds(calendarType, adDate);
  const lastWeekday = weekday(last);
  const start = addDays(first, -weekday(first));
  const end = addDays(last, lastWeekday === weeksDaysCount - 1 ? weeksDaysCount : 6 - lastWeekday);

  const cells: IUseCalendarData.IDates[] = [];
  for (let ad = start; ad <= end; ad = addDays(ad, 1)) {
    const offset = ad < first ? 'prev' : ad > last ? 'next' : undefined;
    const [adYear, adMonth, adDay] = ad.split('-');
    if (!isSupportedAdDate(ad)) {
      cells.push({
        dayOfMonth: isAdView ? Number(adDay) : '',
        year: isAdView ? Number(adYear) : 0,
        month: isAdView ? Number(adMonth) : 0,
        adDate: ad,
        extraDate: '',
        isToday: false,
        isSelected: false,
        isDisabled: true,
        ...(offset && { offset }),
      });
      continue;
    }
    const [bsYear, bsMonth, bsDay] = ad2Bs(ad).split('-');
    cells.push({
      dayOfMonth: isAdView ? Number(adDay) : en2NpNumber(String(Number(bsDay))),
      year: Number(isAdView ? adYear : bsYear),
      month: Number(isAdView ? adMonth : bsMonth),
      adDate: ad,
      extraDate: isAdView ? en2NpNumber(bsDay) : adDay,
      isToday: isTodayAdDate(ad),
      isSelected: !offset && ad === selectedAdDate,
      ...(isDayDisabled?.(ad) && { isDisabled: true }),
      ...(offset && { offset }),
    });
  }
  return chunk(cells, weeksDaysCount);
};

export { getMonthGrid, monthBounds };
