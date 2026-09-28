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

export interface CalendarProps {
  /** Controlled selection. `null` = nothing selected. */
  value?: Date | null;
  /** Initial selection when uncontrolled. Defaults to today; `null` = nothing selected. */
  defaultValue?: Date | null;
  onChange?: (value: PatroDate | null) => void;
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
  /** Called when the displayed month changes, with its first and last day. */
  onMonthChange?: (month: { start: PatroDate; end: PatroDate }) => void;
}

export interface DatepickerProps extends CalendarProps {
  label?: string;
  /** Shown when there's no value. Defaults to 'Select a date' / 'मिति छान्नुहोस्'. */
  placeholder?: string;
  /** Custom input text for the selected date, replacing the default two-calendar text. */
  formatValue?: (value: PatroDate) => string;
}
