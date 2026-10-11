<p align="center">
  <img src="docs/public/patro-logo.svg" alt="patro logo" width="96" height="96">
</p>

# patrojs

A React calendar and datepicker for Gregorian (AD) and Nepali Bikram Sambat (BS) dates. Show either calendar with the other one's date on every day, pick single dates or ranges, and convert between AD and BS with the built-in utilities.

**[Documentation](https://patro.sudarshanrai.com.np)** · **[Storybook](https://patro.sudarshanrai.com.np/storybook/)** · **[npm](https://www.npmjs.com/package/patrojs)**

## Install

```bash
npm install patrojs@beta
```

Requires React 18 or 19. This is a beta release.

Import the stylesheet once, wherever your app already loads global CSS:

```js
import 'patrojs/style.css';
```

## Usage

### Calendar

```tsx
import { Calendar } from 'patrojs';

function App() {
  return <Calendar calendar='BS' onChange={(value) => console.log(value?.ad, value?.bs)} />;
}
```

### Datepicker

```tsx
import { Datepicker } from 'patrojs';

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
const booked = new Set(['2026-11-03', '2026-11-04']);

<Datepicker
  mode='range'
  minDays={2}
  maxDays={14}
  isDateDisabled={({ ad }) => booked.has(ad)}
  excludeDisabled
/>;
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

"Today" is read in the browser, because the server's date (often UTC) can differ from the visitor's. Without a `value`, the server renders the calendar's frame with the month left blank; it fills in on hydration, with no hydration mismatch.

A `Date` passed from a Server Component arrives as a UTC instant, which is the previous day for visitors west of the server. Pass dates across as `'YYYY-MM-DD'` strings and build the `Date` in a Client Component; see [Server rendering](https://patro.sudarshanrai.com.np/guide/server-rendering).

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

Colors, radii, and fonts are CSS custom properties scoped to `._patro`, not the global `:root` — override any of them from your own CSS, on `._patro` itself (a value set on `:root` or another ancestor doesn't reach the component). Dark theme is an explicit opt-in, not automatic: set `data-theme="dark"` on the component (via the `theme` prop, or the attribute directly) or any ancestor element.

```tsx
<Calendar theme='dark' />

// Override tokens for one instance:
<Calendar style={{ '--patro-accent': 'teal' } as React.CSSProperties} />
```

The Datepicker field is `--patro-input-width` wide (288px by default); set it to `100%` to fill a form column.

Text colour tokens (`--patro-muted`, `--patro-faint` for other months' days, …) meet 4.5:1 on `--patro-surface`; `--patro-disabled` colours days you can't pick.

For pixel-exact Devanagari numerals, load [Noto Sans Devanagari](https://fonts.google.com/noto/specimen/Noto+Sans+Devanagari) yourself — it isn't bundled or auto-injected. It falls back to your system sans-serif otherwise.

## Props

`Calendar` and `Datepicker` share these props. Types are exported: `CalendarProps`, `CalendarSingleProps`, `CalendarRangeProps`, `DatepickerProps`, `DatepickerSingleProps`, `DatepickerRangeProps`, `PatroDate`, `DateRange`, `PatroDateRange`, `PatroLabels`, `Preset`, `CalendarSystem`, `Locale`, `Numerals`.

| Prop                | Type                                                             | Default             | Description                                                                                                                                                                                                                                                                                                                                                  |
| ------------------- | ---------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `calendar`          | `'AD' \| 'BS'`                                                   | `'AD'`              | Which calendar system to display.                                                                                                                                                                                                                                                                                                                            |
| `mode`              | `'single' \| 'range'`                                            | `'single'`          | Pick one day, or a start and an end. See [Date ranges](#date-ranges).                                                                                                                                                                                                                                                                                        |
| `value`             | `Date \| null`                                                   | -                   | Controlled selection. `null` = nothing selected.                                                                                                                                                                                                                                                                                                             |
| `defaultValue`      | `Date \| null`                                                   | -                   | Starting selection when uncontrolled. Omitted or `null` = nothing selected.                                                                                                                                                                                                                                                                                  |
| `onChange`          | `(value: PatroDate \| null) => void`                             | -                   | Called when a day is picked.                                                                                                                                                                                                                                                                                                                                 |
| `showSecondaryDate` | `boolean`                                                        | `true`              | Show the other calendar's date on each day.                                                                                                                                                                                                                                                                                                                  |
| `locale`            | `'en' \| 'ne'`                                                   | each calendar's own | Language for month and weekday names. By default AD is English and BS is Nepali.                                                                                                                                                                                                                                                                             |
| `numerals`          | `'latin' \| 'devanagari'`                                        | each calendar's own | Digits for every number. By default AD uses Latin and BS Devanagari digits.                                                                                                                                                                                                                                                                                  |
| `weekStartsOn`      | `0`–`6`                                                          | `0`                 | First day of the week (0 = Sunday).                                                                                                                                                                                                                                                                                                                          |
| `fixedWeeks`        | `boolean`                                                        | `true`              | Always show 6 week rows so the calendar keeps one height.                                                                                                                                                                                                                                                                                                    |
| `numberOfMonths`    | `number`                                                         | `1`                 | Months side by side (wrapping on narrow screens), e.g. `2` for a stay. Other months' days are hidden so none repeats; arrow keys move across months.                                                                                                                                                                                                         |
| `weekendDays`       | `number[]`                                                       | `[]`                | Weekdays to colour as weekends (0 = Sunday), e.g. `[6]` for Saturday as Nepali calendars do. Colour: `--patro-weekend`.                                                                                                                                                                                                                                      |
| `dayClassName`      | `(date: PatroDate) => string \| undefined`                       | -                   | Extra class names for a day, e.g. `({ bs }) => holidays.has(bs) ? 'holiday' : undefined`.                                                                                                                                                                                                                                                                    |
| `dayContent`        | `(date: PatroDate) => ReactNode`                                 | -                   | Extra content in a day's top-left corner, e.g. event dots. Visual only; pair it with `dayLabel`.                                                                                                                                                                                                                                                             |
| `dayLabel`          | `(date: PatroDate) => string \| undefined`                       | -                   | Appended to a day's accessible name, e.g. `({ bs }) => holidays[bs]`.                                                                                                                                                                                                                                                                                        |
| `onMonthChange`     | `({ start, end }: { start: PatroDate; end: PatroDate }) => void` | -                   | Called when the displayed month changes.                                                                                                                                                                                                                                                                                                                     |
| `defaultMonth`      | `Date`                                                           | today's month       | Month shown when nothing is selected, e.g. decades back for a date of birth.                                                                                                                                                                                                                                                                                 |
| `month`             | `Date`                                                           | -                   | Controlled displayed month. Navigation only calls `onMonthChange`: `onMonthChange={({ start }) => setMonth(start.date)}`.                                                                                                                                                                                                                                    |
| `showTodayButton`   | `boolean`                                                        | `false`             | Show a "Today" button that jumps to and selects today.                                                                                                                                                                                                                                                                                                       |
| `presets`           | `{ label: string; value: Date \| DateRange \| (() => …) }[]`     | -                   | Quick picks under the grid, e.g. `{ label: 'Next 7 days', value: () => ({ start: new Date(), end: addDays(new Date(), 6) }) }`. `Date` in single mode, `DateRange` in range mode; functions are read when the button renders and when it's clicked. Presets that break the bounds or range rules are disabled; the one matching the value is marked pressed. |
| `today`             | `Date`                                                           | visitor's clock     | The current date. See [Server rendering](#server-rendering-nextjs-remix).                                                                                                                                                                                                                                                                                    |
| `labels`            | `Partial<PatroLabels>`                                           | display language    | Override accessible names and button text (`previousMonth`, `nextMonth`, `today`, `chooseDate`, `clear`, …). Defaults follow `locale`: English or Nepali.                                                                                                                                                                                                    |
| `autoFocus`         | `boolean`                                                        | `false`             | Focus the day grid on mount. On `Datepicker` it focuses the input instead.                                                                                                                                                                                                                                                                                   |
| `className`         | `string`                                                         | -                   | Added to the root element.                                                                                                                                                                                                                                                                                                                                   |
| `style`             | `CSSProperties`                                                  | -                   | Inline styles on the root, including `--patro-*` token overrides.                                                                                                                                                                                                                                                                                            |
| `theme`             | `'light' \| 'dark'`                                              | -                   | Sets `data-theme` on the component root. See [Theming](#theming).                                                                                                                                                                                                                                                                                            |
| `minDate`           | `Date`                                                           | -                   | Earliest selectable day. Earlier days are disabled and navigation stops there.                                                                                                                                                                                                                                                                               |
| `maxDate`           | `Date`                                                           | -                   | Latest selectable day.                                                                                                                                                                                                                                                                                                                                       |
| `isDateDisabled`    | `(date: PatroDate) => boolean`                                   | -                   | Disable individual days, e.g. `({ date }) => date.getDay() === 6` for Saturdays.                                                                                                                                                                                                                                                                             |
| `minDays`           | `number`                                                         | -                   | Range mode: fewest days a range can span, counting both ends. See [Date ranges](#date-ranges).                                                                                                                                                                                                                                                               |
| `maxDays`           | `number`                                                         | -                   | Range mode: most days a range can span, counting both ends.                                                                                                                                                                                                                                                                                                  |
| `excludeDisabled`   | `boolean`                                                        | `false`             | Range mode: ranges can't contain disabled days, e.g. booked nights.                                                                                                                                                                                                                                                                                          |

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
| `portal`                                                                 | `boolean`                                                                         | `false`                                 | Render the popover in `document.body` (escapes `overflow: hidden`). Leave it off inside modal dialogs, which block clicks and focus outside themselves. Theme it with the `theme` prop; ancestor `data-theme` won't reach it.                                                                                                           |
| `name`                                                                   | `string`                                                                          | -                                       | Submits the date with native forms.                                                                                                                                                                                                                                                                                                     |
| `valueFormat`                                                            | `'ad' \| 'bs'`                                                                    | `'ad'`                                  | Submitted format, `'YYYY-MM-DD'`.                                                                                                                                                                                                                                                                                                       |
| `required`                                                               | `boolean`                                                                         | `false`                                 | Blocks native form submission while empty.                                                                                                                                                                                                                                                                                              |
| `id`, `autoFocus`, `aria-label`, `aria-describedby`, `onFocus`, `onBlur` |                                                                                   |                                         | Passed to the input.                                                                                                                                                                                                                                                                                                                    |

`ref` points at the focusable field: the combobox element, or the text input when `editable`.

With form libraries, connect it as a controlled field: react-hook-form's `Controller`, or Formik's `setFieldValue`. `register()` doesn't fit, since `onChange` receives a `PatroDate`, not an event. See [Forms](https://patro.sudarshanrai.com.np/guide/forms#form-libraries).

## Utilities

The AD ↔ BS conversion functions used internally are also exported directly, if you just need date math without the UI:

```ts
import { ad2Bs, bs2Ad, isValidAdDate, isValidBsDate } from 'patrojs';

ad2Bs('2022-10-24'); // '2079-07-07'
ad2Bs(new Date(2022, 9, 24)); // '2079-07-07' (read in local time)
bs2Ad('2079-07-07'); // '2022-10-24'
bs2Ad('२०७९-०७-०७'); // '2022-10-24'

isValidBsDate('2080-01-32'); // false
```

They're also available from `patrojs/utils`, which, unlike the main entry, isn't marked `'use client'`, so React Server Components and other server code can call them.

Dates are `'YYYY-MM-DD'` strings, in Latin or Devanagari digits. `ad2Bs`/`bs2Ad` throw a `RangeError` for a malformed, impossible (e.g. `'2026-02-30'`) or unsupported date, and a `TypeError` for a non-string; `isValidAdDate`/`isValidBsDate` return a boolean instead, e.g. for form validation.

Supported range: AD `1921-04-13` through `2043-04-14` (BS `1978-01-01` through `2099-12-31`).

## Contributing

Bug reports, ideas and pull requests are welcome. For anything bigger than a small fix, please [open an issue](https://github.com/mrsudarshanrai/patro/issues) first so we can agree on the approach.

```bash
npm ci
npm run storybook   # try your change on Calendar/Datepicker at localhost:6006
npm run lint
npm run typecheck
npm test
npm run build
```

Library source, tests and stories live in `package/`; the docs site is in `docs/`. Commits run ESLint and Prettier on staged files, and CI runs the full checks on every pull request.

Changes to the BS date table (`package/constants/dateConstants.ts`) need a source for the new dates, added as a test in `package/test/dateTable.test.ts`.

## License

[MIT](LICENSE) © Sudarshan Rai
