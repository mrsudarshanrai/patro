# Props

`Calendar` and `Datepicker` share these props. `DateInput` is a `Date` or an AD `'YYYY-MM-DD'` string (Latin or Devanagari digits), e.g. `minDate='2026-01-01'`. Strings are safe to pass from Server Components; `onChange` always gives you a `PatroDate`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `calendar` | `'AD' \| 'BS'` | `'AD'` | Which calendar system to display. |
| `mode` | `'single' \| 'range'` | `'single'` | Pick one day, or a start and an end. See [Date ranges](../guide/date-ranges). |
| `value` | `DateInput \| null` | - | Controlled selection. `null` = nothing selected. |
| `defaultValue` | `DateInput \| null` | - | Starting selection when uncontrolled. Omitted or `null` = nothing selected. |
| `onChange` | `(value: PatroDate \| null) => void` | - | Called when a day is picked. |
| `showSecondaryDate` | `boolean` | `true` | Show the other calendar's date on each day. |
| `locale` | `'en' \| 'ne'` | each calendar's own | Language for month and weekday names. By default AD is English and BS is Nepali. |
| `numerals` | `'latin' \| 'devanagari'` | each calendar's own | Digits for every number. By default AD uses Latin and BS Devanagari digits. |
| `weekStartsOn` | `0`–`6` | `0` | First day of the week (0 = Sunday). |
| `fixedWeeks` | `boolean` | `true` | Always show 6 week rows so the calendar keeps one height. |
| `numberOfMonths` | `number` | `1` | Months side by side (wrapping on narrow screens), e.g. `2` for a stay. Other months' days are hidden so none repeats; arrow keys move across months. |
| `weekendDays` | `number[]` | `[]` | Weekdays to colour as weekends (0 = Sunday), e.g. `[6]` for Saturday as Nepali calendars do. Colour: `--patro-weekend`. |
| `dayClassName` | `(date: PatroDate) => string \| undefined` | - | Extra class names for a day, e.g. `({ bs }) => holidays.has(bs) ? 'holiday' : undefined`. |
| `dayContent` | `(date: PatroDate) => ReactNode` | - | Extra content in a day's top-left corner, e.g. event dots. Visual only; pair it with `dayLabel`. |
| `dayLabel` | `(date: PatroDate) => string \| undefined` | - | Appended to a day's accessible name, e.g. `({ bs }) => holidays[bs]`. |
| `onMonthChange` | `({ start, end }: { start: PatroDate; end: PatroDate }) => void` | - | Called when the displayed month changes. |
| `defaultMonth` | `DateInput` | today's month | Month shown when nothing is selected, e.g. decades back for a date of birth. |
| `month` | `DateInput` | - | Controlled displayed month. Navigation only calls `onMonthChange`: `onMonthChange={({ start }) => setMonth(start.date)}`. |
| `showTodayButton` | `boolean` | `false` | Show a "Today" button that jumps to and selects today. |
| `presets` | `{ label: string; value: Date \| DateRange \| (() => …) }[]` | - | Quick picks under the grid, e.g. `{ label: 'Next 7 days', value: () => ({ start: new Date(), end: addDays(new Date(), 6) }) }`. `Date` in single mode, `DateRange` in range mode; functions are read when the button renders and when it's clicked. Presets that break the bounds or range rules are disabled; the one matching the value is marked pressed. |
| `today` | `DateInput` | visitor's clock | The current date. See [Server rendering](../guide/server-rendering). |
| `labels` | `Partial<PatroLabels>` | display language | Override accessible names and button text (`previousMonth`, `nextMonth`, `today`, `chooseDate`, `clear`, …). Defaults follow `locale`: English or Nepali. |
| `autoFocus` | `boolean` | `false` | Focus the day grid on mount. On `Datepicker` it focuses the input instead. |
| `className` | `string` | - | Added to the root element. |
| `style` | `CSSProperties` | - | Inline styles on the root, including `--patro-*` token overrides. |
| `theme` | `'light' \| 'dark'` | - | Sets `data-theme` on the component root. See [Theming](../guide/theming). |
| `minDate` | `DateInput` | - | Earliest selectable day. Earlier days are disabled and navigation stops there. |
| `maxDate` | `DateInput` | - | Latest selectable day. |
| `isDateDisabled` | `(date: PatroDate) => boolean` | - | Disable individual days, e.g. `({ date }) => date.getDay() === 6` for Saturdays. |

## Range mode only

With `mode='range'`, `value`/`defaultValue` are `DateRange` and `onChange` receives a `PatroDateRange` (see [Types](./types)). These props only apply there:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `minDays` | `number` | - | Fewest days a range can span, counting both ends. |
| `maxDays` | `number` | - | Most days a range can span, counting both ends. |
| `excludeDisabled` | `boolean` | `false` | Ranges can't contain disabled days. |

Picking an end that breaks one starts a new range there. See [Date ranges](../guide/date-ranges#rules).

## `Datepicker` only

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | `string` | - | Text shown above the input, linked to it for screen readers. |
| `placeholder` | `string` | `'Select a date'` / `'मिति छान्नुहोस्'` | Shown when there's no value. |
| `formatValue` | `(value: PatroDate) => string` | - | Custom input text, e.g. `({ bs }) => bs`. |
| `editable` | `boolean` | `false` | Let people type the date too, in the displayed calendar: `2083-07-12`, `2083/7/12`, Latin or Devanagari digits. Committed on Enter or when leaving the field; text that isn't an allowed date is marked invalid on Enter and reverts on leave. ArrowDown opens the calendar. Single mode only; `formatValue` isn't used while editable. |
| `clearable` | `boolean` | `false` | Show a button that clears the value (`onChange(null)`). |
| `disabled` | `boolean` | `false` | Can't be focused or opened. |
| `readOnly` | `boolean` | `false` | Focusable, but can't be opened or changed. |
| `invalid` | `boolean` | `false` | Error styling (`--patro-danger`) and `aria-invalid`. |
| `closeOnSelect` | `boolean` | `true` | Close the popover after picking a day. |
| `open` / `defaultOpen` | `boolean` | - / `false` | Controlled / initial popover state. |
| `onOpenChange` | `(open: boolean) => void` | - | Called when the popover wants to open or close. |
| `placement` | `'bottom-start' \| 'bottom-end' \| 'top-start' \| 'top-end' \| 'bottom' \| 'top'` | `'bottom-start'` | Popover position. |
| `portal` | `boolean` | `false` | Render the popover in `document.body` (escapes `overflow: hidden`). Inside a modal dialog use `portalContainer` instead: a modal blocks clicks and focus outside itself. Theme it with the `theme` prop; ancestor `data-theme` won't reach it. |
| `portalContainer` | `Element \| null` | - | Render the popover into this element, e.g. a modal dialog's content; turns `portal` on. |
| `name` | `string` | - | Submits the date with native forms. |
| `valueFormat` | `'ad' \| 'bs'` | `'ad'` | Submitted format, `'YYYY-MM-DD'`. |
| `required` | `boolean` | `false` | Blocks native form submission while empty. |
| `id`, `autoFocus`, `aria-label`, `aria-labelledby`, `aria-describedby`, `data-*`, `onFocus`, `onBlur` |  |  | Passed to the input. |
| `inputClassName` | `string` | - | Extra class names for the field, e.g. a form library's input class. |
| `inputMode` | `string` | - | Mobile keyboard for the `editable` text input, e.g. `'numeric'`. |

`ref` points at the focusable field: the combobox element, or the text input when `editable`.
