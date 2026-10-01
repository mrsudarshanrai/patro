import type { CSSProperties, ReactNode } from 'react';
import type {
  CalendarSystem,
  Locale,
  Numerals,
  PatroDate,
  PatroLabels,
  RangeSelection,
  SingleSelection,
} from '../types/public';
import type { DisplayOptions, GridCell } from '../utils';

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
