import {
  MAX_AD_DATE,
  MAX_BS_YEAR,
  MIN_BS_YEAR,
  START_ENGLISH_DATE,
} from '../constants/dateConstants';
import { CalendarSystem, Locale, Numerals, PatroDate, PatroLabels } from '../types/public';
import { adDateToLocalDate, createDateString, en2NpNumber, toLatinDigits } from './dateUtils';
import { ad2Bs, isValidAdDate } from './ad_utils/ad2bs';
import { bs2Ad, isValidBsDate } from './bs_utils/bs2ad';

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

// Editable text for a date: 'YYYY-MM-DD' in `system`, in its digits.
const formatInputDate = (adDate: string, system: CalendarSystem, options: DisplayOptions = {}) => {
  const [year, month, day] = partsIn(adDate, system);
  const text = createDateString(year, month, day);
  return numeralsOf(system, options) === 'devanagari' ? en2NpNumber(text) : text;
};

// Typed year, month and day in `system` (any of - / . or spaces between, either digit set) to an
// AD date, or null if it isn't a real, supported date.
const parseInputDate = (text: string, system: CalendarSystem) => {
  const parts = toLatinDigits(text.trim()).split(/[-/.\s]+/);
  if (parts.length !== 3 || !/^\d{4}$/.test(parts[0])) return null;
  if (!parts.slice(1).every((part) => /^\d{1,2}$/.test(part))) return null;
  const date = createDateString(...(parts.map(Number) as [number, number, number]));
  if (system === 'BS') return isValidBsDate(date) ? bs2Ad(date) : null;
  return isValidAdDate(date) ? date : null;
};

const LABELS: Record<Locale, PatroLabels> = {
  en: {
    previousMonth: 'Previous month',
    nextMonth: 'Next month',
    previousYear: 'Previous year',
    nextYear: 'Next year',
    previousYears: 'Previous 12 years',
    nextYears: 'Next 12 years',
    chooseMonth: 'choose month',
    chooseYear: 'choose year',
    today: 'Today',
    presets: 'Quick picks',
    chooseDate: 'Choose a date',
    clear: 'Clear date',
  },
  ne: {
    previousMonth: 'अघिल्लो महिना',
    nextMonth: 'अर्को महिना',
    previousYear: 'अघिल्लो वर्ष',
    nextYear: 'अर्को वर्ष',
    previousYears: 'अघिल्लो १२ वर्ष',
    nextYears: 'अर्को १२ वर्ष',
    chooseMonth: 'महिना छान्नुहोस्',
    chooseYear: 'वर्ष छान्नुहोस्',
    today: 'आज',
    presets: 'छिटो छनोट',
    chooseDate: 'मिति छान्नुहोस्',
    clear: 'मिति हटाउनुहोस्',
  },
};

const labelsFor = (
  system: CalendarSystem,
  options: DisplayOptions,
  overrides?: Partial<PatroLabels>,
): PatroLabels => ({ ...LABELS[languageOf(system, options)], ...overrides });

export {
  partsIn as datePartsIn,
  labelsFor,
  formatInputDate,
  parseInputDate,
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
