import {
  addDays,
  datePartsIn,
  GridCell,
  monthBounds,
  monthSpan,
  supportedAdDate,
  supportedAdRange,
} from '../utils';
import { stepViewAnchor } from './hooks/useCalendarData';
import type { CalendarSystem, DateRange, Preset } from '../types/public';
import type { PresetItem, RangeRules, ShownRange, VisibleMonth } from './CalendarType';

const YEARS_PER_PAGE = 12;

const DAY_STEPS: Record<string, number> = {
  ArrowLeft: -1,
  ArrowRight: 1,
  ArrowUp: -7,
  ArrowDown: 7,
};

const visibleMonths = (
  calendar: CalendarSystem,
  first: VisibleMonth,
  count: number,
  grid: (anchor: string) => GridCell[][],
): VisibleMonth[] => {
  const months = [first];
  for (let i = 1; i < count; i++) {
    const anchor = stepViewAnchor(months[i - 1].first, calendar, 1);
    // No months past the end of the BS table.
    if (anchor === months[i - 1].first) break;
    const [start, end] = monthBounds(calendar, anchor);
    months.push({ first: start, last: end, dates: grid(anchor) });
  }
  return months;
};

const isValidRangeEnd = (
  start: string,
  end: string,
  { minDays, maxDays, excludeDisabled, isDayDisabled }: RangeRules,
) => {
  if (end < start) return false;
  const days = Math.round((Date.parse(end) - Date.parse(start)) / 86_400_000) + 1;
  if ((minDays && days < minDays) || (maxDays && days > maxDays)) return false;
  if (!excludeDisabled) return true;
  for (let day = start; day <= end; day = addDays(day, 1)) if (isDayDisabled(day)) return false;
  return true;
};

// Same day `months` away in the displayed calendar, clamped to that month's length.
const shiftMonths = (adDate: string, months: number, calendar: CalendarSystem) => {
  const [year, month, day] = datePartsIn(adDate, calendar);
  const index = year * 12 + month - 1 + months;
  const span = monthSpan(calendar, Math.floor(index / 12), (index % 12) + 1);
  if (!span) return null;
  const target = addDays(span[0], day - 1);
  return target > span[1] ? span[1] : target;
};

// Focus stays on something visible after month changes: the first candidate in view, else the first day.
const activeDay = (
  months: VisibleMonth[],
  candidates: (string | null | undefined)[],
  isDayDisabled: (adDate: string) => boolean,
) => {
  const ownDays = months.flatMap((month) => month.dates.flat().filter((cell) => !cell.offset));
  const enabledDays = ownDays.filter((cell) => !cell.isDisabled);
  const monthCells = enabledDays.length ? enabledDays : ownDays;
  const monthStart = monthCells[0].adDate;
  const monthEnd = monthCells[monthCells.length - 1].adDate;
  const inView = (adDate?: string | null): adDate is string =>
    !!adDate && adDate >= monthStart && adDate <= monthEnd && !isDayDisabled(adDate);
  const adDate = candidates.find(inView) ?? monthStart;
  const index = Math.max(
    0,
    months.findIndex((month) => adDate >= month.first && adDate <= month.last),
  );
  return { adDate, index };
};

// Presets resolve on every render so "Today"-style ones stay current and can be disabled.
const resolvePresets = (
  presets: Preset<Date>[] | Preset<DateRange>[] | undefined,
  {
    range,
    selectedAdDate,
    isDayDisabled,
    isValidEnd,
  }: {
    range: ShownRange | null;
    selectedAdDate: string | null;
    isDayDisabled: (adDate: string) => boolean;
    isValidEnd: (start: string, end: string) => boolean;
  },
): PresetItem[] =>
  (presets ?? []).map(({ label, value }) => {
    const resolved = typeof value === 'function' ? value() : value;
    if (range) {
      const { start, end } = supportedAdRange(resolved as DateRange);
      const valid =
        !!start && !!end && !isDayDisabled(start) && !isDayDisabled(end) && isValidEnd(start, end);
      return {
        label,
        disabled: !valid,
        pressed: !!start && start === range.start && end === range.end,
        start,
        end,
      };
    }
    const adDate = supportedAdDate(resolved as Date);
    return {
      label,
      disabled: !adDate || isDayDisabled(adDate),
      pressed: !!adDate && adDate === selectedAdDate,
      start: adDate,
      end: null,
    };
  });

export {
  YEARS_PER_PAGE,
  DAY_STEPS,
  visibleMonths,
  isValidRangeEnd,
  shiftMonths,
  activeDay,
  resolvePresets,
};
