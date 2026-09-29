import type { CSSProperties, FocusEvent, ReactNode } from 'react';

export type CalendarSystem = 'AD' | 'BS';
export type Locale = 'en' | 'ne';
export type Numerals = 'latin' | 'devanagari';

export interface PatroDate {
  /** Local midnight of the selected day. */
  date: Date;
  /** AD date, 'YYYY-MM-DD'. */
  ad: string;
  /** BS date, 'YYYY-MM-DD'. */
  bs: string;
}

/** Accessible names and button text; each defaults to the display language's. */
export interface PatroLabels {
  previousMonth: string;
  nextMonth: string;
  previousYear: string;
  nextYear: string;
  previousYears: string;
  nextYears: string;
  chooseMonth: string;
  chooseYear: string;
  today: string;
  /** Group of `presets` buttons. */
  presets: string;
  /** Datepicker popover. */
  chooseDate: string;
  /** Datepicker clear button. */
  clear: string;
}

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface PatroDateRange {
  start: PatroDate | null;
  end: PatroDate | null;
}

/** A quick pick shown under the grid. A function value is read when clicked, e.g. for "Next 7 days". */
export interface Preset<T> {
  label: string;
  value: T | (() => T);
}

export interface SingleSelection {
  /** Pick one day. The default. */
  mode?: 'single';
  /** Controlled selection. `null` = nothing selected. */
  value?: Date | null;
  /** Initial selection when uncontrolled. Defaults to nothing selected. */
  defaultValue?: Date | null;
  onChange?: (value: PatroDate | null) => void;
  /** Quick picks under the grid, e.g. `[{ label: 'Today', value: () => new Date() }]`. */
  presets?: Preset<Date>[];
}

export interface RangeSelection {
  /** Pick a start day, then an end day. */
  mode: 'range';
  /** Controlled range. */
  value?: DateRange;
  /** Initial range when uncontrolled. Defaults to empty. */
  defaultValue?: DateRange;
  /** Called on every pick, so `end` is `null` while only the start is chosen. */
  onChange?: (value: PatroDateRange) => void;
  /** Fewest days a range can span, counting both ends. Picking a closer end starts a new range there. */
  minDays?: number;
  /** Most days a range can span, counting both ends. Picking a farther end starts a new range there. */
  maxDays?: number;
  /** Ranges can't contain disabled days; picking an end past one starts a new range there. */
  excludeDisabled?: boolean;
  /** Quick picks under the grid, e.g. "This week" or "Next 7 days". */
  presets?: Preset<DateRange>[];
}

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

export interface DatepickerBaseProps extends CalendarBaseProps {
  label?: string;
  /** Shown when there's no value. Defaults to 'Select a date' / 'मिति छान्नुहोस्'. */
  placeholder?: string;
  disabled?: boolean;
  /** Focusable and shows its value, but can't be opened or changed. */
  readOnly?: boolean;
  /** Error styling and `aria-invalid`, e.g. after failed form validation. */
  invalid?: boolean;
  /**
   * Let people type the date as well, e.g. 2083-07-12 or 2083/7/12, in the displayed calendar and
   * Latin or Devanagari digits. Committed on Enter or when leaving the field. Single mode only.
   */
  editable?: boolean;
  /** Close the popover after picking a day. Defaults to true. */
  closeOnSelect?: boolean;
  /** Controlled popover state. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Show a button that clears the value. */
  clearable?: boolean;
  /** Form field name; the date is submitted with the form. Range mode submits `name[start]` and `name[end]`. */
  name?: string;
  /** Submitted date format: 'ad' (default) or 'bs', both 'YYYY-MM-DD'. */
  valueFormat?: 'ad' | 'bs';
  /** Block form submission while empty (native form validation). */
  required?: boolean;
  id?: string;
  autoFocus?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
  onFocus?: (event: FocusEvent<HTMLElement>) => void;
  onBlur?: (event: FocusEvent<HTMLElement>) => void;
  /** Popover position relative to the input. Defaults to 'bottom-start'. */
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end' | 'bottom' | 'top';
  /** Render the popover in `document.body`, e.g. to escape `overflow: hidden` parents. */
  portal?: boolean;
}

export type DatepickerSingleProps = DatepickerBaseProps &
  SingleSelection & {
    /** Custom input text for the selected date, replacing the default two-calendar text. */
    formatValue?: (value: PatroDate) => string;
  };
export type DatepickerRangeProps = DatepickerBaseProps &
  RangeSelection & {
    /** Custom input text for the selected range. */
    formatValue?: (value: PatroDateRange) => string;
  };
export type DatepickerProps = DatepickerSingleProps | DatepickerRangeProps;
