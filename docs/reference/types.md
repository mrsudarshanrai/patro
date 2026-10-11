# Types

All exported from `patrojs`:

```ts
import type {
  CalendarProps,
  CalendarSingleProps,
  CalendarRangeProps,
  DatepickerProps,
  DatepickerSingleProps,
  DatepickerRangeProps,
  PatroDate,
  PatroDateRange,
  DateInput,
  DateRange,
  DateRangeInput,
  Preset,
  PatroLabels,
  CalendarSystem,
  Locale,
  Numerals,
} from 'patrojs';
```

## `PatroDate`

What `onChange` (single mode) gives you:

```ts
interface PatroDate {
  /** Local midnight of the selected day. */
  date: Date;
  /** AD date, 'YYYY-MM-DD'. */
  ad: string;
  /** BS date, 'YYYY-MM-DD'. */
  bs: string;
}
```

## `DateInput`

What every date prop accepts: a `Date` (its local calendar day), or an AD `'YYYY-MM-DD'` string in Latin or Devanagari digits. A string that isn't a real date counts as no date, with a console warning in development.

```ts
type DateInput = Date | string;
```

## `DateRangeInput` / `DateRange` / `PatroDateRange`

Range-mode `value`/`defaultValue` take a `DateRangeInput`; `onChange` gives a `PatroDateRange`. `DateRange` is the same shape with `Date`s only, handy for your own state:

```ts
interface DateRangeInput {
  start: DateInput | null;
  end: DateInput | null;
}

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface PatroDateRange {
  start: PatroDate | null;
  end: PatroDate | null;
}
```

## `Preset<T>`

A `presets` entry: `Preset<DateInput>` in single mode, `Preset<DateRangeInput>` in range mode. A function value is read when rendered and clicked, so relative presets stay current.

```ts
interface Preset<T> {
  label: string;
  value: T | (() => T);
}
```

## `PatroLabels`

What `labels` overrides (all optional there). Defaults are English or Nepali, following `locale`.

```ts
interface PatroLabels {
  previousMonth: string;
  nextMonth: string;
  previousYear: string;
  nextYear: string;
  previousYears: string; // year grid, 12 at a time
  nextYears: string;
  chooseMonth: string;
  chooseYear: string;
  today: string;
  presets: string; // the presets group
  chooseDate: string; // Datepicker popover and unlabelled field
  clear: string; // Datepicker clear button
}
```

## `CalendarProps` / `DatepickerProps`

Each is a union: `mode='range'` narrows `value`, `defaultValue`, `onChange` and `formatValue` to the range-mode shapes automatically, without you needing to annotate anything — this works whether or not your project has TypeScript's `strict` mode on.

```ts
type CalendarProps = CalendarSingleProps | CalendarRangeProps;
type DatepickerProps = DatepickerSingleProps | DatepickerRangeProps;
```

Use `CalendarProps`/`DatepickerProps` when you don't need to distinguish the mode (e.g. spreading props through), or the `*SingleProps`/`*RangeProps` variants directly when you're writing a component that only ever uses one mode.

## `CalendarSystem`, `Locale`, `Numerals`

```ts
type CalendarSystem = 'AD' | 'BS';
type Locale = 'en' | 'ne';
type Numerals = 'latin' | 'devanagari';
```
