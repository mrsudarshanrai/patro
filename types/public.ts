export type CalendarSystem = 'AD' | 'BS';

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
  theme?: 'light' | 'dark';
}

export interface DatepickerProps extends CalendarProps {
  label?: string;
  /** Shown when there's no value. Defaults to 'Select a date' / 'मिति छान्नुहोस्'. */
  placeholder?: string;
}
