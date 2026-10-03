# Controlled vs uncontrolled

## The value

Pass `defaultValue` (or nothing: no selection) and the component keeps track of the selection itself. Pass `value` to control it from your own state:

```tsx
import { useState } from 'react';
import { Datepicker } from 'patro';

const [value, setValue] = useState<Date | null>(null);

<Datepicker value={value} onChange={(picked) => setValue(picked?.date ?? null)} />;
```

`null` means nothing is selected; `Datepicker` then shows its placeholder, and `Calendar` shows the current month with no day highlighted.

Once you pass `value` (even `null`), the component is controlled: clicking a day still fires `onChange`, but the displayed selection only changes when you update `value` yourself.

## The displayed month

With a value, the calendar opens on its month. Without one, it opens on the current month, or on `defaultMonth`:

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

When there's no value, `Datepicker` shows a default placeholder, `'Select a date'` (AD) or `'मिति छान्नुहोस्'` (BS), or your own via `placeholder`.

## The popover

`open` / `onOpenChange` control the Datepicker popover the same way; `defaultOpen` sets its starting state.
