# Controlled vs uncontrolled

## The value

Pass `defaultValue` (or nothing: no selection) and the component keeps track of the selection itself. Pass `value` to control it from your own state:

```tsx
import { useState } from 'react';
import { Datepicker } from 'patrojs';

const [value, setValue] = useState<Date | null>(null);

<Datepicker value={value} onChange={(picked) => setValue(picked?.date ?? null)} />;
```

`null` means nothing is selected; `Datepicker` then shows its placeholder, and `Calendar` shows the current month with no day highlighted.

`value` can also be an AD `'YYYY-MM-DD'` string, so state kept as strings works as it is: `value={dob}` with `onChange={(picked) => setDob(picked?.ad ?? null)}`.

::: info Days a time zone skipped
A few time zones skipped a whole day, such as `Pacific/Apia` on 2011-12-30. A visitor in that zone can't have that day selected, whether `value` is a `Date` or a string, because the selection is kept as a local `Date`, which can't fall on a day that didn't happen there. `picked.ad` and `picked.bs` are still correct, so store those if it matters.
:::

Once you pass `value` (even `null`), the component is controlled: clicking a day still fires `onChange`, but the displayed selection only changes when you update `value` yourself.

## The displayed month

With a value, the calendar opens on its month, and a new value moves the view to its month, including a day picked from the previous or next month's days at the edges of the grid. With `numberOfMonths`, a value already on screen leaves the view where it is. Without a value, it opens on the current month, or on `defaultMonth`. A value outside the supported range selects nothing, logs a warning in development, and opens on the nearest supported month:

```tsx
// A date of birth: open decades back instead of on today.
<Datepicker label='Date of birth' defaultMonth={new Date(2000, 0, 1)} maxDate={new Date()} />
```

To control the displayed month yourself, pass `month` and update it from `onMonthChange`. Navigation then only asks; the view moves when you update `month`:

```tsx
const [month, setMonth] = useState(new Date());

<Calendar month={month} onMonthChange={({ start }) => setMonth(start.date)} />;
```

`onMonthChange` receives the first and last day of the month as `PatroDate`s. Without `month`, it simply reports every month the view moves to.

## Clearing

`Datepicker` can show a clear button:

```tsx
<Datepicker clearable value={value} onChange={(picked) => setValue(picked?.date ?? null)} />
```

Clicking it calls `onChange(null)` (or `onChange({ start: null, end: null })` in range mode).

## Placeholders

When there's no value, `Datepicker` shows a default placeholder in the calendar's language, or your own via `placeholder`:

- single mode: `'Select a date'` / `'मिति छान्नुहोस्'`
- range mode: `'Select dates'` / `'मितिहरू छान्नुहोस्'`
- `editable`: `'YYYY-MM-DD'`, the format to type

## The popover

`open` / `onOpenChange` control the Datepicker popover the same way; `defaultOpen` sets its starting state.
