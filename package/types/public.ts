export type CalendarSystem = 'AD' | 'BS';
export type Locale = 'en' | 'ne';
export type Numerals = 'latin' | 'devanagari';

/** A day: a `Date` (its local calendar day), or an AD `'YYYY-MM-DD'` string in Latin or Devanagari digits. */
export type DateInput = Date | string;

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

/** A range given to `value`, `defaultValue` or `presets`: either end a `Date` or an AD `'YYYY-MM-DD'` string. */
export interface DateRangeInput {
  start: DateInput | null;
  end: DateInput | null;
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
  value?: DateInput | null;
  /** Initial selection when uncontrolled. Defaults to nothing selected. */
  defaultValue?: DateInput | null;
  onChange?: (value: PatroDate | null) => void;
  /** Quick picks under the grid, e.g. `[{ label: 'Today', value: () => new Date() }]`. */
  presets?: Preset<DateInput>[];
}

export interface RangeSelection {
  /** Pick a start day, then an end day. */
  mode: 'range';
  /** Controlled range. */
  value?: DateRangeInput;
  /** Initial range when uncontrolled. Defaults to empty. */
  defaultValue?: DateRangeInput;
  /** Called on every pick, so `end` is `null` while only the start is chosen. */
  onChange?: (value: PatroDateRange) => void;
  /** Fewest days a range can span, counting both ends. Picking a closer end starts a new range there. */
  minDays?: number;
  /** Most days a range can span, counting both ends. Picking a farther end starts a new range there. */
  maxDays?: number;
  /** Ranges can't contain disabled days; picking an end past one starts a new range there. */
  excludeDisabled?: boolean;
  /** Quick picks under the grid, e.g. "This week" or "Next 7 days". */
  presets?: Preset<DateRangeInput>[];
}
