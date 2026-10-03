# Keyboard & accessibility

## Day grid

The day grid is a single Tab stop with a visible focus ring, following the WAI-ARIA date picker pattern.

| Key | Action |
| --- | --- |
| Arrow keys | Move by one day / one week, changing month as needed |
| PageUp / PageDown | Same day in the previous / next month |
| Shift + PageUp / PageDown | Same day in the previous / next year |
| Home / End | First / last day of the week |
| Enter / Space | Select the focused day |
| Escape | Close the `Datepicker` popover |
| Enter / Space / ArrowDown on the `Datepicker` field | Open the popover and focus the day grid |

Days outside `minDate`/`maxDate`, or disabled by `isDateDisabled`, are skipped by arrow-key movement and can't be selected. With `numberOfMonths`, arrow keys move across the visible months, and the view only scrolls when focus leaves them.

## Quick month and year navigation

Click the month title to switch to a month grid, and again for a 12-year grid, in whichever calendar system is displayed. Picking a year shows its months; picking a month shows its days. Escape goes back to the day grid.

The month and year grids are one Tab stop each too: arrow keys, Home and End move, Enter picks. A birthdate decades back is a handful of keystrokes.

## Today button

Set `showTodayButton` to add a button below the grid that jumps to the current month and selects today. It's disabled if today falls outside `minDate`/`maxDate` or is itself disabled.

## The Datepicker field

- It's a WAI-ARIA **select-only combobox**, or, with `editable`, a text input with the combobox role. So `required`, `readOnly` and `invalid` are announced by screen readers, and `aria-controls` points at the open popover.
- Its accessible name comes from `label`, or `aria-label`, or else "Choose a date" / "मिति छान्नुहोस्".
- Opening it from the keyboard moves focus into the day grid; opening it with the mouse leaves focus where you clicked. Picking a day or pressing Escape returns focus to the field.
- Tabbing out of an open popover closes it.

## Day names

Each day's accessible name spells out the date in both calendars, e.g. "12 October 2026, २६ आश्विन २०८३". `dayLabel` can append more, like a holiday name (see [Holidays, events & presets](./days-and-presets)).

## Colours

Default text colours meet WCAG AA contrast in both themes, and Windows high-contrast mode is supported (see [Theming](./theming#contrast-and-high-contrast-mode)). The components are checked with axe in a real browser, light and dark.
