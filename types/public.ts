import type { CSSProperties, FocusEvent } from 'react';

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
  /** Show a "Today" button that jumps to and selects today. */
  showTodayButton?: boolean;
  /** Added to the root element. */
  className?: string;
  /** Inline styles on the root element, e.g. `{ '--patro-accent': 'teal' }`. */
  style?: CSSProperties;
}

export interface DatepickerProps extends CalendarProps {
  label?: string;
  /** Shown when there's no value. Defaults to 'Select a date' / 'मिति छान्नुहोस्'. */
  placeholder?: string;
  /** Custom input text for the selected date, replacing the default two-calendar text. */
  formatValue?: (value: PatroDate) => string;
  disabled?: boolean;
  /** Focusable and shows its value, but can't be opened or changed. */
  readOnly?: boolean;
  /** Error styling and `aria-invalid`, e.g. after failed form validation. */
  invalid?: boolean;
  /** Close the popover after picking a day. Defaults to true. */
  closeOnSelect?: boolean;
  /** Controlled popover state. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Show a button that clears the value (`onChange(null)`). */
  clearable?: boolean;
  /** Form field name; the date is submitted with the form. */
  name?: string;
  /** Submitted date format: 'ad' (default) or 'bs', both 'YYYY-MM-DD'. */
  valueFormat?: 'ad' | 'bs';
  /** Block form submission while empty (native form validation). */
  required?: boolean;
  id?: string;
  autoFocus?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
  onFocus?: (event: FocusEvent<HTMLDivElement>) => void;
  onBlur?: (event: FocusEvent<HTMLDivElement>) => void;
  /** Popover position relative to the input. Defaults to 'bottom-start'. */
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end' | 'bottom' | 'top';
  /** Render the popover in `document.body`, e.g. to escape `overflow: hidden` parents. */
  portal?: boolean;
}
