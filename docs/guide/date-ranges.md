# Date ranges

Set `mode='range'` on either component.

```tsx
<Datepicker
  mode='range'
  label='Stay'
  onChange={({ start, end }) => console.log(start?.ad, end?.ad)}
/>
```

## Picking

- The first click sets the **start**.
- The second click sets the **end**.
- Clicking before the start, or after a complete range, starts a new range.
- A one-day range (clicking the same day twice) is allowed, unless `minDays` says otherwise.
- While only the start is picked, hovering (or moving focus with the keyboard) previews the range that would result.

## Values

In range mode, `value`/`defaultValue` are `{ start: Date | null; end: Date | null }`, and `onChange` receives `{ start: PatroDate | null; end: PatroDate | null }` on **every** pick, so `end` is `null` after the first click. That lets you react to a half-picked range (e.g. show "Pick an end date" in your own UI).

```tsx
import { useState } from 'react';
import type { DateRange } from 'patrojs';

const [range, setRange] = useState<DateRange>({ start: null, end: null });

<Datepicker
  mode='range'
  value={range}
  onChange={({ start, end }) => setRange({ start: start?.date ?? null, end: end?.date ?? null })}
/>;
```

A range given end-first is treated as the same range, start-first.

## Rules

All optional:

| Prop | Effect |
| --- | --- |
| `minDays` | Fewest days a range can span, counting both ends. `minDays={3}` is at least 2 nights. |
| `maxDays` | Most days a range can span, counting both ends. |
| `excludeDisabled` | Ranges can't contain disabled days (from `minDate`/`maxDate`/`isDateDisabled`), e.g. booked nights. |

Picking an end that breaks a rule starts a new range at that day instead, and the hover preview only appears for valid ends.

```tsx
const booked = new Set(['2026-11-03', '2026-11-04']);

<Datepicker
  mode='range'
  minDays={3}
  maxDays={15}
  isDateDisabled={({ ad }) => booked.has(ad)}
  excludeDisabled
/>;
```

## Two months side by side

`numberOfMonths={2}` shows consecutive months next to each other (wrapping on narrow screens), which makes ranges across a month boundary easy to pick. Other months' days are hidden so none appears twice, and arrow keys move across the months.

```tsx
<Datepicker mode='range' numberOfMonths={2} />
```

## Presets

`presets` adds quick-pick buttons under the grid. In range mode each value is a `DateRange`, or a function returning one, read when the button renders and when it's clicked:

```tsx
const addDays = (date: Date, days: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

<Datepicker
  mode='range'
  presets={[
    { label: 'Next 7 days', value: () => ({ start: new Date(), end: addDays(new Date(), 6) }) },
    { label: 'Next 30 days', value: () => ({ start: new Date(), end: addDays(new Date(), 29) }) },
  ]}
/>;
```

Presets that break `minDate`/`maxDate`, disabled days or the rules above are disabled, and the one matching the current value is marked pressed. See [Holidays, events & presets](./days-and-presets).

## Datepicker behaviour

- The popover stays open after the first click and closes once the end is picked (unless `closeOnSelect={false}`).
- The field shows something like `5 Oct – 9 Oct 2026`, writing the year on both sides only when it differs (`28 Dec 2026 – 3 Jan 2027`).
- `name="stay"` submits two fields with a native form: `stay[start]` and `stay[end]`.
- `clearable` resets both ends at once.
- `formatValue` receives the whole range instead of a single date.
- `editable` (typing) is for single dates only.

## Styling

The band between the two ends uses the `--patro-range-bg` token; see [Theming](./theming).
