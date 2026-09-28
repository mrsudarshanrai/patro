import {
  MAX_AD_DATE,
  MAX_BS_YEAR,
  MIN_BS_YEAR,
  START_ENGLISH_DATE,
} from '../constants/dateConstants';
import { CalendarSystem, Locale, Numerals, PatroDate } from '../types/public';
import { adDateToLocalDate, en2NpNumber } from './dateUtils';
import { ad2Bs } from './ad_utils/ad2bs';

export type DisplayOptions = { locale?: Locale; numerals?: Numerals };

const AD_MONTHS = {
  en: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  ne: [
    'जनवरी',
    'फेब्रुअरी',
    'मार्च',
    'अप्रिल',
    'मे',
    'जुन',
    'जुलाई',
    'अगस्ट',
    'सेप्टेम्बर',
    'अक्टोबर',
    'नोभेम्बर',
    'डिसेम्बर',
  ],
};

const BS_MONTHS = {
  en: [
    'Baisakh',
    'Jestha',
    'Asar',
    'Shrawan',
    'Bhadra',
    'Asoj',
    'Kartik',
    'Mangsir',
    'Poush',
    'Magh',
    'Falgun',
    'Chaitra',
  ],
  ne: [
    'बैशाख',
    'जेष्ठ',
    'आषाढ',
    'श्रावण',
    'भाद्र',
    'आश्विन',
    'कार्तिक',
    'मंसिर',
    'पौष',
    'माघ',
    'फाल्गुन',
    'चैत्र',
  ],
};

const WEEKDAYS = {
  en: {
    long: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    short: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  },
  ne: {
    long: ['आइतवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'बिहिवार', 'शुक्रवार', 'शनिवार'],
    short: ['आइत', 'सोम', 'मङ्गल', 'बुध', 'बिही', 'शुक्र', 'शनि'],
  },
};

// Unset options mean each calendar uses its own language and digits (AD English, BS Nepali).
const languageOf = (system: CalendarSystem, options: DisplayOptions): Locale =>
  options.locale ?? (system === 'BS' ? 'ne' : 'en');
const numeralsOf = (system: CalendarSystem, options: DisplayOptions): Numerals =>
  options.numerals ?? (system === 'BS' ? 'devanagari' : 'latin');

const otherSystem = (system: CalendarSystem): CalendarSystem => (system === 'AD' ? 'BS' : 'AD');

const formatNumber = (value: number, system: CalendarSystem, options: DisplayOptions = {}) =>
  numeralsOf(system, options) === 'devanagari' ? en2NpNumber(String(value)) : String(value);

const monthName = (
  system: CalendarSystem,
  month: number,
  options: DisplayOptions = {},
  short = false,
) => {
  const language = languageOf(system, options);
  if (system === 'BS') return BS_MONTHS[language][month - 1];
  const name = AD_MONTHS[language][month - 1];
  return short && language === 'en' ? name.slice(0, 3) : name;
};

const weekdayNames = (system: CalendarSystem, options: DisplayOptions = {}) =>
  WEEKDAYS[languageOf(system, options)];

// [year, month, day] of an AD date in the given calendar. Days just outside the table map
// to the neighbouring BS month so month ranges at the edges still read correctly.
const partsIn = (adDate: string, system: CalendarSystem) => {
  if (system === 'AD') return adDate.split('-').map(Number);
  if (adDate < START_ENGLISH_DATE) return [MIN_BS_YEAR - 1, 12, 0];
  if (adDate > MAX_AD_DATE) return [MAX_BS_YEAR + 1, 1, 0];
  return ad2Bs(adDate).split('-').map(Number);
};

const formatDate = (
  adDate: string,
  system: CalendarSystem,
  options: DisplayOptions = {},
  { short = false, withYear = true } = {},
) => {
  const [year, month, day] = partsIn(adDate, system);
  const parts = [formatNumber(day, system, options), monthName(system, month, options, short)];
  if (withYear) parts.push(formatNumber(year, system, options));
  return parts.join(' ');
};

// Header title for the month starting at `firstAdDate`, e.g. "October 2026" / "कार्तिक २०८३".
const monthTitle = (firstAdDate: string, system: CalendarSystem, options: DisplayOptions = {}) => {
  const [year, month] = partsIn(firstAdDate, system);
  return `${monthName(system, month, options)} ${formatNumber(year, system, options)}`;
};

// The other calendar's months covered by a month, e.g. "Oct – Nov 2026" / "Dec 2026 – Jan 2027".
const monthRange = (
  firstAdDate: string,
  lastAdDate: string,
  system: CalendarSystem,
  options: DisplayOptions = {},
) => {
  const other = otherSystem(system);
  const short = other === 'AD';
  const [startYear, startMonth] = partsIn(firstAdDate, other);
  const [endYear, endMonth] = partsIn(lastAdDate, other);
  const name = (month: number) => monthName(other, month, options, short);
  const year = (value: number) => formatNumber(value, other, options);
  if (startYear !== endYear) {
    return `${name(startMonth)} ${year(startYear)} – ${name(endMonth)} ${year(endYear)}`;
  }
  if (startMonth === endMonth) return `${name(startMonth)} ${year(startYear)}`;
  return `${name(startMonth)} – ${name(endMonth)} ${year(startYear)}`;
};

const toPatroDate = (adDate: string): PatroDate => ({
  date: adDateToLocalDate(adDate),
  ad: adDate,
  bs: ad2Bs(adDate),
});

export {
  toPatroDate,
  otherSystem,
  languageOf,
  formatNumber,
  monthName,
  weekdayNames,
  formatDate,
  monthTitle,
  monthRange,
};
