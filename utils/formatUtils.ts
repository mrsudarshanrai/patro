import { ICalendar } from '../Calendar/types';
import { PatroDate } from '../types/public';
import { config } from '../constants/dateConstants';
import {
  adDateToLocalDate,
  createDateString,
  en2NpNumber,
  getMonth,
  remove1stZero,
  zeroPad,
} from './dateUtils';
import { ad2Bs } from './ad_utils/ad2bs';
const { en, np } = config;

const isAd = (value: string) => value === ICalendar.CalendarTypeEnum.AD;

const getAdHeaderMonth = (bsMonth: string, adMonth: number, bsYear: string, adYear: string) => {
  const parsedBsMonth = parseInt(remove1stZero(bsMonth));
  const npMonths = Object.keys(np.months);
  // An AD month starts mid-way through one BS month and ends in the next.
  return {
    oMonth: `${npMonths[parsedBsMonth - 1]}/${npMonths[parsedBsMonth % 12]} -`,
    month: Object.keys(en.months)[adMonth - 1],
    oYear: bsYear,
    year: adYear,
  };
};

const getBsHeaderMonth = (bsMonth: string, adMonth: number, bsYear: string, adYear: string) => {
  const parsedBsMonth = parseInt(remove1stZero(bsMonth));
  const enMonths = Object.values(en.months);
  const beforeMonthIndex = adMonth - 1;
  return {
    oMonth: `${enMonths[beforeMonthIndex < 0 ? 11 : beforeMonthIndex]}/${
      enMonths[adMonth === 12 ? 0 : adMonth]
    } -`,
    month: Object.keys(np.months)[parsedBsMonth - 1],
    oYear: adYear,
    year: bsYear,
  };
};

type IHeaderMonths = [bsMonth: string, adMonth: number, bsYear: string, adYear: string];

const getHeaderMonths = (calendarType: ICalendar.calendarType, ...args: IHeaderMonths) => {
  if (isAd(calendarType)) return getAdHeaderMonth(...args);
  else return getBsHeaderMonth(...args);
};

const formatDisplayDate = (date: Date, calendarType: ICalendar.calendarType) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if (isAd(calendarType)) {
    return `${zeroPad(day)} ${getMonth(month)} ${year}`;
  }

  const [bsYear, bsMonth, bsDay] = ad2Bs(createDateString(year, month, day)).split('-');
  const bsMonthName = Object.keys(np.months)[parseInt(remove1stZero(bsMonth)) - 1];
  return `${en2NpNumber(bsDay)} ${bsMonthName} ${en2NpNumber(bsYear)}`;
};

// The other calendar's short date, e.g. a Datepicker input's secondary text.
const formatSecondaryDate = (date: Date, calendarType: ICalendar.calendarType) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if (isAd(calendarType)) {
    const [, bsMonth, bsDay] = ad2Bs(createDateString(year, month, day)).split('-');
    const bsMonthName = Object.keys(np.months)[parseInt(remove1stZero(bsMonth)) - 1];
    return `${en2NpNumber(bsDay)} ${bsMonthName}`;
  }

  return `${day} ${getMonth(month).slice(0, 3)} ${year}`;
};

const toPatroDate = (adDate: string): PatroDate => ({
  date: adDateToLocalDate(adDate),
  ad: adDate,
  bs: ad2Bs(adDate),
});

export {
  toPatroDate,
  isAd,
  getAdHeaderMonth,
  getBsHeaderMonth,
  getHeaderMonths,
  formatDisplayDate,
  formatSecondaryDate,
};
