# patro

A React calendar and datepicker for the Nepali Bikram Sambat (BS) calendar, with built-in AD (Gregorian) ↔ BS date conversion utilities.

## Install

```bash
npm install patro
```

Requires React 18 or 19.

Import the stylesheet once, wherever your app already loads global CSS:

```js
import 'patro/style.css';
```

## Usage

### Calendar

```tsx
import { Calendar } from 'patro';

function App() {
  return <Calendar calendar='BS' onChange={(value) => console.log(value?.ad, value?.bs)} />;
}
```

### Datepicker

```tsx
import { Datepicker } from 'patro';

function App() {
  return <Datepicker label='Date' onChange={(value) => console.log(value?.ad)} />;
}
```

`Datepicker` renders an input that opens `Calendar` in a popover; picking a day closes it and updates the input.

### Date ranges

Set `mode='range'`. The first pick sets the start and the second the end; picking before the start, or after a complete range, starts over. While only the start is picked, hovering shows a preview.

```tsx
<Datepicker
  mode='range'
  label='Stay'
  onChange={({ start, end }) => console.log(start?.ad, end?.ad)}
/>
```

In range mode `value`/`defaultValue` are `{ start: Date | null; end: Date | null }` and `onChange` receives `{ start: PatroDate | null; end: PatroDate | null }` on every pick. The `Datepicker` closes once the end is picked, and `name='stay'` submits `stay[start]` and `stay[end]`. Band colour: `--patro-range-bg`.

Range rules, all optional: `minDays` and `maxDays` limit the length (counting both ends), and `excludeDisabled` keeps disabled days (e.g. booked nights) out of a range. Picking an end that breaks a rule starts a new range at that day instead.

```tsx
<Datepicker mode='range' minDays={2} maxDays={14} isDateDisabled={isBooked} excludeDisabled />
```

### Controlled vs uncontrolled

Pass `defaultValue` (or nothing: no selection, showing the current month) and the component keeps track of the selection itself. Pass `value` to control it from your state:

```tsx
const [value, setValue] = useState<Date | null>(null);

<Datepicker value={value} onChange={(picked) => setValue(picked?.date ?? null)} />;
```

`null` means nothing is selected; the `Datepicker` then shows its placeholder.

`onChange` receives a `PatroDate`:

```ts
{
  date: Date;
  ad: '2026-10-29';
  bs: '2083-07-12';
}
```

### Server rendering (Next.js, Remix)

The package is marked `'use client'`, so it can be imported from React Server Components.

"Today" is read in the browser, because the server's date (often UTC) can differ from the visitor's. Without a `value`, the server renders the calendar's frame with the month left blank; it fills in on hydration, with no hydration mismatch. To render the month on the server too, pass `today`, e.g. a date computed on the server for the visitor's timezone.

## Quick month and year navigation

Click the month title to switch to a month grid, and again for a 12-year grid, in whichever calendar is displayed. Picking a year shows its months; picking a month shows its days. Escape goes back to the days.

## Keyboard

The day grid is a single Tab stop with a visible focus ring.

| Key                                               | Action                                               |
| ------------------------------------------------- | ---------------------------------------------------- |
| Arrow keys                                        | Move by one day / one week, changing month as needed |
| PageUp / PageDown                                 | Same day in the previous / next month                |
| Shift + PageUp / PageDown                         | Same day in the previous / next year                 |
| Home / End                                        | First / last day of the week                         |
| Enter / Space                                     | Select the focused day                               |
| Escape                                            | Close the Datepicker popover                         |
| Enter / Space / ArrowDown on the Datepicker input | Open the popover and focus the day grid              |

The month and year grids are also one Tab stop each: arrow keys, Home and End move, Enter picks.

The Datepicker input is a WAI-ARIA select-only combobox (so `required`, `readOnly` and `invalid` are announced). Tabbing out of an open popover closes it. Default colours meet WCAG AA contrast, and Windows high-contrast mode (`forced-colors`) is supported.

## Theming

Colors, radii, and fonts are CSS custom properties scoped to `._patro`, not the global `:root` — override any of them from your own CSS. Dark theme is an explicit opt-in, not automatic: set `data-theme="dark"` on the component (via the `theme` prop, or the attribute directly) or any ancestor element.

```tsx
<Calendar theme='dark' />

// Override tokens for one instance:
<Calendar style={{ '--patro-accent': 'teal' } as React.CSSProperties} />
```

Text colour tokens (`--patro-muted`, `--patro-faint` for other months' days, …) meet 4.5:1 on `--patro-surface`; `--patro-disabled` colours days you can't pick.

For pixel-exact Devanagari numerals, load [Noto Sans Devanagari](https://fonts.google.com/noto/specimen/Noto+Sans+Devanagari) yourself — it isn't bundled or auto-injected. It falls back to your system sans-serif otherwise.

## Props

`Calendar` and `Datepicker` share these props. Types are exported: `CalendarProps`, `DatepickerProps`, `PatroDate`, `DateRange`, `PatroDateRange`, `PatroLabels`, `Preset`, `CalendarSystem`, `Locale`, `Numerals`.

| Prop                | Type                                                             | Default             | Description                                                                                                                                                                                                                                                                                                                 |
| ------------------- | ---------------------------------------------------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `calendar`          | `'AD' \| 'BS'`                                                   | `'AD'`              | Which calendar system to display.                                                                                                                                                                                                                                                                                           |
| `mode`              | `'single' \| 'range'`                                            | `'single'`          | Pick one day, or a start and an end. See [Date ranges](#date-ranges).                                                                                                                                                                                                                                                       |
| `value`             | `Date \| null`                                                   | -                   | Controlled selection. `null` = nothing selected.                                                                                                                                                                                                                                                                            |
| `defaultValue`      | `Date \| null`                                                   | -                   | Starting selection when uncontrolled. Omitted or `null` = nothing selected.                                                                                                                                                                                                                                                 |
| `onChange`          | `(value: PatroDate \| null) => void`                             | -                   | Called when a day is picked.                                                                                                                                                                                                                                                                                                |
| `showSecondaryDate` | `boolean`                                                        | `true`              | Show the other calendar's date on each day.                                                                                                                                                                                                                                                                                 |
| `locale`            | `'en' \| 'ne'`                                                   | each calendar's own | Language for month and weekday names. By default AD is English and BS is Nepali.                                                                                                                                                                                                                                            |
| `numerals`          | `'latin' \| 'devanagari'`                                        | each calendar's own | Digits for every number. By default AD uses Latin and BS Devanagari digits.                                                                                                                                                                                                                                                 |
| `weekStartsOn`      | `0`–`6`                                                          | `0`                 | First day of the week (0 = Sunday).                                                                                                                                                                                                                                                                                         |
| `fixedWeeks`        | `boolean`                                                        | `true`              | Always show 6 week rows so the calendar keeps one height.                                                                                                                                                                                                                                                                   |
| `weekendDays`       | `number[]`                                                       | `[]`                | Weekdays to colour as weekends (0 = Sunday), e.g. `[6]` for Saturday as Nepali calendars do. Colour: `--patro-weekend`.                                                                                                                                                                                                     |
| `dayClassName`      | `(date: PatroDate) => string \| undefined`                       | -                   | Extra class names for a day, e.g. `({ bs }) => holidays.has(bs) ? 'holiday' : undefined`.                                                                                                                                                                                                                                   |
| `dayContent`        | `(date: PatroDate) => ReactNode`                                 | -                   | Extra content in a day's top-left corner, e.g. event dots. Visual only; pair it with `dayLabel`.                                                                                                                                                                                                                            |
| `dayLabel`          | `(date: PatroDate) => string \| undefined`                       | -                   | Appended to a day's accessible name, e.g. `({ bs }) => holidays[bs]`.                                                                                                                                                                                                                                                       |
| `onMonthChange`     | `({ start, end }: { start: PatroDate; end: PatroDate }) => void` | -                   | Called when the displayed month changes.                                                                                                                                                                                                                                                                                    |
| `defaultMonth`      | `Date`                                                           | today's month       | Month shown when nothing is selected, e.g. decades back for a date of birth.                                                                                                                                                                                                                                                |
| `month`             | `Date`                                                           | -                   | Controlled displayed month. Navigation only calls `onMonthChange`: `onMonthChange={({ start }) => setMonth(start.date)}`.                                                                                                                                                                                                   |
| `showTodayButton`   | `boolean`                                                        | `false`             | Show a "Today" button that jumps to and selects today.                                                                                                                                                                                                                                                                      |
| `presets`           | `{ label: string; value: Date \| DateRange \| (() => …) }[]`     | -                   | Quick picks under the grid, e.g. `{ label: 'Next 7 days', value: () => ({ start: new Date(), end: addDays(new Date(), 6) }) }`. `Date` in single mode, `DateRange` in range mode; functions are read when clicked. Presets that break the bounds or range rules are disabled; the one matching the value is marked pressed. |
| `today`             | `Date`                                                           | visitor's clock     | The current date. See [Server rendering](#server-rendering-nextjs-remix).                                                                                                                                                                                                                                                   |
| `labels`            | `Partial<PatroLabels>`                                           | display language    | Override accessible names and button text (`previousMonth`, `nextMonth`, `today`, `chooseDate`, `clear`, …). Defaults follow `locale`: English or Nepali.                                                                                                                                                                   |
| `autoFocus`         | `boolean`                                                        | `false`             | Focus the day grid on mount. On `Datepicker` it focuses the input instead.                                                                                                                                                                                                                                                  |
| `className`         | `string`                                                         | -                   | Added to the root element.                                                                                                                                                                                                                                                                                                  |
| `style`             | `CSSProperties`                                                  | -                   | Inline styles on the root, including `--patro-*` token overrides.                                                                                                                                                                                                                                                           |
| `theme`             | `'light' \| 'dark'`                                              | -                   | Sets `data-theme` on the component root. See [Theming](#theming).                                                                                                                                                                                                                                                           |
| `minDate`           | `Date`                                                           | -                   | Earliest selectable day. Earlier days are disabled and navigation stops there.                                                                                                                                                                                                                                              |
| `maxDate`           | `Date`                                                           | -                   | Latest selectable day.                                                                                                                                                                                                                                                                                                      |
| `isDateDisabled`    | `(date: PatroDate) => boolean`                                   | -                   | Disable individual days, e.g. `({ date }) => date.getDay() === 6` for Saturdays.                                                                                                                                                                                                                                            |

### Datepicker only

| Prop                                                                     | Type                                                                              | Default                                 | Description                                                                                                                                                                                                                                                                                                                             |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `label`                                                                  | `string`                                                                          | -                                       | Text shown above the input, linked to it for screen readers.                                                                                                                                                                                                                                                                            |
| `placeholder`                                                            | `string`                                                                          | `'Select a date'` / `'मिति छान्नुहोस्'` | Shown when there's no value.                                                                                                                                                                                                                                                                                                            |
| `formatValue`                                                            | `(value: PatroDate) => string`                                                    | -                                       | Custom input text, e.g. `({ bs }) => bs`.                                                                                                                                                                                                                                                                                               |
| `editable`                                                               | `boolean`                                                                         | `false`                                 | Let people type the date too, in the displayed calendar: `2083-07-12`, `2083/7/12`, Latin or Devanagari digits. Committed on Enter or when leaving the field; text that isn't an allowed date is marked invalid on Enter and reverts on leave. ArrowDown opens the calendar. Single mode only; `formatValue` isn't used while editable. |
| `clearable`                                                              | `boolean`                                                                         | `false`                                 | Show a button that clears the value (`onChange(null)`).                                                                                                                                                                                                                                                                                 |
| `disabled`                                                               | `boolean`                                                                         | `false`                                 | Can't be focused or opened.                                                                                                                                                                                                                                                                                                             |
| `readOnly`                                                               | `boolean`                                                                         | `false`                                 | Focusable, but can't be opened or changed.                                                                                                                                                                                                                                                                                              |
| `invalid`                                                                | `boolean`                                                                         | `false`                                 | Error styling (`--patro-danger`) and `aria-invalid`.                                                                                                                                                                                                                                                                                    |
| `closeOnSelect`                                                          | `boolean`                                                                         | `true`                                  | Close the popover after picking a day.                                                                                                                                                                                                                                                                                                  |
| `open` / `defaultOpen`                                                   | `boolean`                                                                         | - / `false`                             | Controlled / initial popover state.                                                                                                                                                                                                                                                                                                     |
| `onOpenChange`                                                           | `(open: boolean) => void`                                                         | -                                       | Called when the popover wants to open or close.                                                                                                                                                                                                                                                                                         |
| `placement`                                                              | `'bottom-start' \| 'bottom-end' \| 'top-start' \| 'top-end' \| 'bottom' \| 'top'` | `'bottom-start'`                        | Popover position.                                                                                                                                                                                                                                                                                                                       |
| `portal`                                                                 | `boolean`                                                                         | `false`                                 | Render the popover in `document.body` (escapes `overflow: hidden`). Theme it with the `theme` prop; ancestor `data-theme` won't reach it.                                                                                                                                                                                               |
| `name`                                                                   | `string`                                                                          | -                                       | Submits the date with native forms.                                                                                                                                                                                                                                                                                                     |
| `valueFormat`                                                            | `'ad' \| 'bs'`                                                                    | `'ad'`                                  | Submitted format, `'YYYY-MM-DD'`.                                                                                                                                                                                                                                                                                                       |
| `required`                                                               | `boolean`                                                                         | `false`                                 | Blocks native form submission while empty.                                                                                                                                                                                                                                                                                              |
| `id`, `autoFocus`, `aria-label`, `aria-describedby`, `onFocus`, `onBlur` |                                                                                   |                                         | Passed to the input.                                                                                                                                                                                                                                                                                                                    |

`ref` points at the focusable field: the combobox element, or the text input when `editable`.

## Utilities

The AD ↔ BS conversion functions used internally are also exported directly, if you just need date math without the UI:

```ts
import { ad2Bs, bs2Ad, isValidAdDate, isValidBsDate } from 'patro';

ad2Bs('2022-10-24'); // '2079-07-07'
ad2Bs(new Date(2022, 9, 24)); // '2079-07-07' (read in local time)
bs2Ad('2079-07-07'); // '2022-10-24'
bs2Ad('२०७९-०७-०७'); // '2022-10-24'

isValidBsDate('2080-01-32'); // false
```

They're also available from `patro/utils`, which, unlike the main entry, isn't marked `'use client'`, so React Server Components and other server code can call them.

Dates are `'YYYY-MM-DD'` strings, in Latin or Devanagari digits. `ad2Bs`/`bs2Ad` throw a `RangeError` for a malformed, impossible (e.g. `'2026-02-30'`) or unsupported date, and a `TypeError` for a non-string; `isValidAdDate`/`isValidBsDate` return a boolean instead, e.g. for form validation.

Supported range: AD `1921-04-13` through `2043-04-14` (BS `1978-01-01` through `2099-12-31`).

## Development

```bash
npm ci
npm run storybook   # visually exercise Calendar/Datepicker
npm test
npm run build
```
