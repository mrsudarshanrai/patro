# patro

A React calendar and datepicker for the Nepali Bikram Sambat (BS) calendar, with built-in AD (Gregorian) ↔ BS date conversion utilities.

## Install

```bash
npm install patro
```

Requires React 18 or 19.

Import the stylesheet once, wherever your app already loads global CSS:

```js
import 'patro/dist/css/style.css';
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

### Controlled vs uncontrolled

Pass `defaultValue` (or nothing, meaning today) and the component keeps track of the selection itself. Pass `value` to control it from your state:

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

## Keyboard

The day grid is a single Tab stop with a visible focus ring.

| Key                                               | Action                                               |
| ------------------------------------------------- | ---------------------------------------------------- |
| Arrow keys                                        | Move by one day / one week, changing month as needed |
| PageUp / PageDown                                 | Previous / next month                                |
| Enter / Space                                     | Select the focused day                               |
| Escape                                            | Close the Datepicker popover                         |
| Enter / Space / ArrowDown on the Datepicker input | Open the popover                                     |

## Theming

Colors, radii, and fonts are CSS custom properties scoped to `._patro`, not the global `:root` — override any of them from your own CSS. Dark theme is an explicit opt-in, not automatic: set `data-theme="dark"` on the component (via the `theme` prop, or the attribute directly) or any ancestor element.

```tsx
<Calendar theme='dark' />
```

For pixel-exact Devanagari numerals, load [Noto Sans Devanagari](https://fonts.google.com/noto/specimen/Noto+Sans+Devanagari) yourself — it isn't bundled or auto-injected. It falls back to your system sans-serif otherwise.

## Props

`Calendar` and `Datepicker` accept the same props (`Datepicker` also takes `label`, `placeholder` and `formatValue`). Types are exported: `CalendarProps`, `DatepickerProps`, `PatroDate`, `CalendarSystem`, `Locale`, `Numerals`.

| Prop                | Type                                       | Default                                 | Description                                                                                                             |
| ------------------- | ------------------------------------------ | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `calendar`          | `'AD' \| 'BS'`                             | `'AD'`                                  | Which calendar system to display.                                                                                       |
| `value`             | `Date \| null`                             | -                                       | Controlled selection. `null` = nothing selected.                                                                        |
| `defaultValue`      | `Date \| null`                             | today                                   | Starting selection when uncontrolled. `null` = nothing selected.                                                        |
| `onChange`          | `(value: PatroDate \| null) => void`       | -                                       | Called when a day is picked.                                                                                            |
| `showSecondaryDate` | `boolean`                                  | `true`                                  | Show the other calendar's date on each day.                                                                             |
| `locale`            | `'en' \| 'ne'`                             | each calendar's own                     | Language for month and weekday names. By default AD is English and BS is Nepali.                                        |
| `numerals`          | `'latin' \| 'devanagari'`                  | each calendar's own                     | Digits for every number. By default AD uses Latin and BS Devanagari digits.                                             |
| `weekStartsOn`      | `0`–`6`                                    | `0`                                     | First day of the week (0 = Sunday).                                                                                     |
| `fixedWeeks`        | `boolean`                                  | `true`                                  | Always show 6 week rows so the calendar keeps one height.                                                               |
| `weekendDays`       | `number[]`                                 | `[]`                                    | Weekdays to colour as weekends (0 = Sunday), e.g. `[6]` for Saturday as Nepali calendars do. Colour: `--patro-weekend`. |
| `dayClassName`      | `(date: PatroDate) => string \| undefined` | -                                       | Extra class names for a day, e.g. `({ bs }) => holidays.has(bs) ? 'holiday' : undefined`.                               |
| `theme`             | `'light' \| 'dark'`                        | -                                       | Sets `data-theme` on the component root. See [Theming](#theming).                                                       |
| `minDate`           | `Date`                                     | -                                       | Earliest selectable day. Earlier days are disabled and navigation stops there.                                          |
| `maxDate`           | `Date`                                     | -                                       | Latest selectable day.                                                                                                  |
| `isDateDisabled`    | `(date: PatroDate) => boolean`             | -                                       | Disable individual days, e.g. `({ date }) => date.getDay() === 6` for Saturdays.                                        |
| `label`             | `string`                                   | -                                       | `Datepicker` only. Text shown above the input.                                                                          |
| `placeholder`       | `string`                                   | `'Select a date'` / `'मिति छान्नुहोस्'` | `Datepicker` only. Shown when there's no value.                                                                         |
| `formatValue`       | `(value: PatroDate) => string`             | -                                       | `Datepicker` only. Custom input text, e.g. `({ bs }) => bs` for `2083-07-12`.                                           |

## Utilities

The AD ↔ BS conversion functions used internally are also exported directly, if you just need date math without the UI:

```ts
import { ad2Bs, bs2Ad } from 'patro';

ad2Bs('2022-10-24'); // '2079-07-07'
bs2Ad('2079-07-07'); // '2022-10-24'
```

Supported range: AD `1921-04-13` through `2043-04-14` (BS `1978-01-01` through `2099-12-31`).

## Development

```bash
npm ci
npm run storybook   # visually exercise Calendar/Datepicker
npm test
npm run build
```
