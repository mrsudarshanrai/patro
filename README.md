# patro

A React calendar and datepicker for the Nepali Bikram Sambat (BS) calendar, with built-in AD (Gregorian) ↔ BS date conversion utilities.

## Install

```bash
npm install patro
```

Import the stylesheet once, wherever your app already loads global CSS:

```js
import 'patro/dist/css/style.css';
```

## Usage

### Calendar

```tsx
import { Calendar } from 'patro';

function App() {
  return <Calendar calendarType='BS' showExtra onChange={(date) => console.log(date.adDate)} />;
}
```

### Datepicker

```tsx
import { Datepicker } from 'patro';

function App() {
  return (
    <Datepicker calendarType='AD' label='Date' onChange={(date) => console.log(date.adDate)} />
  );
}
```

`Datepicker` renders an input that opens `Calendar` in a popover on click; selecting a date closes the popover and updates the input.

## Theming

Colors, radii, and fonts are CSS custom properties scoped to `._patro`, not the global `:root` — override any of them from your own CSS. Dark theme is an explicit opt-in, not automatic: set `data-theme="dark"` on the component (via the `theme` prop, or the attribute directly) or any ancestor element.

```tsx
<Calendar theme='dark' />
```

For pixel-exact Devanagari numerals, load [Noto Sans Devanagari](https://fonts.google.com/noto/specimen/Noto+Sans+Devanagari) yourself — it isn't bundled or auto-injected. It falls back to your system sans-serif otherwise.

## Props

`Calendar` and `Datepicker` accept the same props (`Datepicker` also takes `label`):

| Prop           | Type                           | Default | Description                                                                  |
| -------------- | ------------------------------ | ------- | ---------------------------------------------------------------------------- |
| `calendarType` | `'AD' \| 'BS'`                 | `'AD'`  | Which calendar system to display.                                            |
| `defaultDate`  | `Date`                         | today   | The date the calendar opens on. Updating this prop re-syncs the display.     |
| `showExtra`    | `boolean`                      | -       | Show the other calendar system's date as a small subscript on each day cell. |
| `theme`        | `'light' \| 'dark'`            | -       | Sets `data-theme` on the component root. See [Theming](#theming).            |
| `onChange`     | `(date: SelectedDate) => void` | -       | Called when a day is selected. `date.adDate` is the AD date, `'YYYY-MM-DD'`. |
| `label`        | `string`                       | -       | `Datepicker` only. Text label shown above the input.                         |

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
