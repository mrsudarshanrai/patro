import type { CSSProperties, ReactNode } from 'react';
import type {
  CalendarSystem,
  DateRange,
  Locale,
  Numerals,
  PatroDate,
  PatroLabels,
  RangeSelection,
  SingleSelection,
} from '../types/public';
import type { DisplayOptions, GridCell } from '../utils';
import type { PickerItem, PickerView } from './components/CalendarPicker';
import type { useGridFocus } from './hooks/useGridFocus';

export interface CalendarBaseProps {
  /** Calendar system to display. Defaults to 'AD'. */
  calendar?: CalendarSystem;
  /** Show the other calendar's date on each day. Defaults to true. */
  showSecondaryDate?: boolean;
  /** Language of month and weekday names. Defaults to each calendar's own (AD English, BS Nepali). */
  locale?: Locale;
  /** Digits for all numbers. Defaults to each calendar's own (AD Latin, BS Devanagari). */
  numerals?: Numerals;
  theme?: 'light' | 'dark';
  /** Earliest selectable day. */
  minDate?: Date;
  /** Latest selectable day. */
  maxDate?: Date;
  /** Return true to disable a day, e.g. weekends or holidays. */
  isDateDisabled?: (date: PatroDate) => boolean;
  /** First day of the week, 0 = Sunday (default) … 6 = Saturday. */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** Always show 6 week rows so the calendar keeps one height. Defaults to true. */
  fixedWeeks?: boolean;
  /** Weekdays to colour as weekends (0 = Sunday … 6 = Saturday), e.g. [6] as Nepali calendars do. */
  weekendDays?: number[];
  /** Extra class names for a day, e.g. to mark holidays or events. */
  dayClassName?: (date: PatroDate) => string | undefined;
  /** Extra content inside a day, e.g. an event dot; shown in its top-left corner. Visual only: pair it with `dayLabel`. */
  dayContent?: (date: PatroDate) => ReactNode;
  /** Extra text for a day's accessible name, e.g. a holiday: "12 October 2026, …, Dashain". */
  dayLabel?: (date: PatroDate) => string | undefined;
  /** Called when the displayed month changes, with its first and last day. */
  onMonthChange?: (month: { start: PatroDate; end: PatroDate }) => void;
  /** Month to show when nothing is selected, e.g. decades back for a date of birth. Defaults to today's. */
  defaultMonth?: Date;
  /**
   * Controlled displayed month (any day in it). Navigation then only calls `onMonthChange`,
   * e.g. `onMonthChange={({ start }) => setMonth(start.date)}`.
   */
  month?: Date;
  /** Show a "Today" button that jumps to and selects today. */
  showTodayButton?: boolean;
  /**
   * The current date, for the today marker, the Today button and the initial month.
   * Defaults to the visitor's clock, read in the browser. Pass it when server rendering
   * without a value to render the month on the server too, or to pin it in tests.
   */
  today?: Date;
  /** Override accessible names and button text, e.g. for a language other than English or Nepali. */
  labels?: Partial<PatroLabels>;
  /** Months shown side by side, e.g. 2 for picking a stay. Other months' days are hidden then. */
  numberOfMonths?: number;
  /** Focus the day grid on mount, e.g. when the calendar opens in a dialog. */
  autoFocus?: boolean;
  /** Added to the root element. */
  className?: string;
  /** Inline styles on the root element, e.g. `{ '--patro-accent': 'teal' }`. */
  style?: CSSProperties;
}

export type CalendarSingleProps = CalendarBaseProps & SingleSelection;
export type CalendarRangeProps = CalendarBaseProps & RangeSelection;
export type CalendarProps = CalendarSingleProps | CalendarRangeProps;

export interface CalendarGridProps {
  calendar: CalendarSystem;
  display: DisplayOptions;
  showSecondaryDate: boolean;
  dates: GridCell[][];
  onSelect: (adDate: string) => void;
  idPrefix: string;
  focusedAdDate?: string;
  dayClassName?: (date: PatroDate) => string | undefined;
  dayContent?: (date: PatroDate) => ReactNode;
  hideOutsideDays?: boolean;
  dayLabel?: (date: PatroDate) => string | undefined;
  range?: { start: string | null; end: string | null; preview?: string };
  onHoverDay?: (adDate?: string) => void;
}

export interface CalendarHeaderProps {
  title: string;
  subtitle: string;
  onTitleClick?: () => void;
  titleActionLabel?: string;
  showPrev?: boolean;
  showNext?: boolean;
  prevLabel: string;
  nextLabel: string;
  nextMonth: () => void;
  prevMonth: () => void;
  canNextMonth: boolean;
  canPrevMonth: boolean;
}

export interface CalendarDaysProps {
  calendar: CalendarSystem;
  display: DisplayOptions;
  weekStartsOn: number;
  weekendDays?: number[];
}

export interface DayParts {
  year: number;
  month: number;
  date: number;
}

export interface UseCalendarDataResult {
  dates: GridCell[][];
  adDate: string | null;
  bsDate: string | null;
  firstAdDate: string;
  lastAdDate: string;
  nextMonth: () => void;
  prevMonth: () => void;
  goToMonth: (year: number, month: number) => void;
  canNextMonth: boolean;
  canPrevMonth: boolean;
  minAdDate: string;
  maxAdDate: string;
  isDayDisabled: (adDate: string) => boolean;
  pending: boolean;
}

export interface UseCalendarDataOptions {
  minDate?: Date;
  maxDate?: Date;
  isDateDisabled?: (date: PatroDate) => boolean;
  weekStartsOn?: number;
  fixedWeeks?: boolean;
  weekendDays?: number[];
  today?: string | null;
  defaultMonth?: Date;
  month?: Date;
  onMonthChange?: CalendarBaseProps['onMonthChange'];
}

export interface ShownRange {
  start: string | null;
  end: string | null;
}

export interface VisibleMonth {
  first: string;
  last: string;
  dates: GridCell[][];
}

export interface RangeRules {
  minDays?: number;
  maxDays?: number;
  excludeDisabled?: boolean;
  isDayDisabled: (adDate: string) => boolean;
}

export interface PresetItem {
  label: string;
  disabled: boolean;
  pressed: boolean;
  start: string | null;
  end: string | null;
}

export interface UseCalendarValueOptions {
  isRange: boolean;
  value: Date | DateRange | null | undefined;
  defaultValue: Date | DateRange | null | undefined;
  onChange: SingleSelection['onChange'] | RangeSelection['onChange'];
}

export interface UsePickerViewOptions {
  calendar: CalendarSystem;
  display: DisplayOptions;
  text: PatroLabels;
  firstAdDate: string;
  lastAdDate: string;
  minAdDate: string;
  maxAdDate: string;
  prevMonth: () => void;
  nextMonth: () => void;
  canPrevMonth: boolean;
  canNextMonth: boolean;
  goToMonth: (year: number, month: number) => void;
}

export interface UseGridFocusOptions {
  calendar: CalendarSystem;
  months: VisibleMonth[];
  selectedAdDate: string | null;
  todayAdDate: string | null;
  isDayDisabled: (adDate: string) => boolean;
  minAdDate: string;
  maxAdDate: string;
  goToMonth: (year: number, month: number) => void;
  weekStartsOn: number;
  autoFocus: boolean;
  idPrefix: string;
  onSelect: (adDate: string) => void;
}

export interface CalendarHeaderView {
  title: string;
  subtitle: string;
  onTitleClick: (() => void) | undefined;
  titleActionLabel: string | undefined;
  prev: () => void;
  next: () => void;
  canPrev: boolean;
  canNext: boolean;
  prevLabel: string;
  nextLabel: string;
}

export interface CalendarMonthProps {
  header: CalendarHeaderView;
  title: string;
  subtitle: string;
  isFirst: boolean;
  isLast: boolean;
  view: PickerView;
  pickerItems: PickerItem[];
  onPick: (value: number) => void;
  grid: ReturnType<ReturnType<typeof useGridFocus>['gridProps']>;
  weekdays: CalendarDaysProps;
  days: CalendarGridProps;
  onMouseLeave: () => void;
}
