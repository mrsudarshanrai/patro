# Changelog

## 1.0.0-beta.3 (2026-10-11)

### Added

- Every date prop accepts an AD `'YYYY-MM-DD'` string as well as a `Date`: `value`, `defaultValue`, `minDate`, `maxDate`, `defaultMonth`, `month`, `today` and `presets`, including range ends. Strings are safe to pass from Server Components, where a `Date` arrives a day early for visitors west of the server. New types: `DateInput`, `DateRangeInput`.
- `portalContainer` on `Datepicker`: render the popover into a given element, e.g. a modal dialog's content.
- `Datepicker` passes `data-*` attributes, `aria-labelledby`, `inputClassName` and `inputMode` to its field; `Calendar` puts `data-*` attributes on its root.
- A native form reset puts the `Datepicker` back to its `defaultValue` and calls `onChange`.
- Arrow keys past the edge, and PageUp/PageDown, page through the year grid (12 years) and the month grid (a year).
- `isValidAdDate` accepts a `Date`, like `ad2Bs`.

### Fixed

- An invalid `Date` or date string counts as no date, with a console warning in development, instead of opening the calendar on its last supported month. A value outside the supported range warns too.
- `ad2Bs(new Date(NaN))` throws `Invalid Date.` instead of reporting `"NaN-aN-aN"`.

## 1.0.0-beta.2 (2026-10-11)

### Fixed

- `patrojs/style.css` no longer resets `font-weight` on the whole page; it only applies inside the components.
- Escape in the Datepicker popover, or in the month/year picker, no longer also closes a surrounding dialog (native `<dialog>`, Radix, Headless UI).
- The popover stays reachable on small screens: two months stack instead of overflowing a phone, its top edge stays on screen, and it hides once its field scrolls out of view.
- `--patro-input-width: 100%` now fills the form column; it used to make the field narrower.
- Focus returns to the calendar after picking a month or a year, or pressing Escape in the picker.
- Days a timezone skipped (Kiribati, 31 Dec 1994) no longer break month lengths or crash the calendar.
- Host page styles for `header`, `p` and `svg` no longer reach the calendar header, day cells or icons, and the header is no longer announced as a page banner.
- `patrojs/utils` types resolve under TypeScript's `node10` module resolution.

### Changed

- Today is announced with `aria-current="date"`, and the component roots carry a `lang` attribute for their language.
- Apps that import only `Calendar` no longer bundle the Datepicker and Floating UI (about 10 kB gzipped smaller).

## 1.0.0-beta.1 (2026-10-10)

First real release. `0.0.1`–`0.0.4-beta` were early test publishes with no announced API; this is a ground-up rewrite and not compatible with them.

### Breaking, if you used a `0.0.x` version

- `Calendar`/`Datepicker` props renamed: `calendarType` → `calendar`, `showExtra` → `showSecondaryDate`, `defaultDate` → `value` / `defaultValue`.
- `onChange` now receives a `PatroDate` (`{ date, ad, bs }`), or `null`, instead of an internal grid-cell object.
- Nothing is selected by default; pass `defaultValue={new Date()}` for the old today-selected start.
- `ad2Bs`/`bs2Ad` accept only `'YYYY-MM-DD'` and throw `RangeError`/`TypeError` with clearer messages.

### Added

- Date-range selection: `mode="range"` on both components, with `minDays`, `maxDays` and `excludeDisabled`.
- `numberOfMonths` to show several months side by side.
- `minDate`, `maxDate`, `isDateDisabled` for disabling individual days or ranges.
- `locale` and `numerals` — display month/weekday names and digits in English/Nepali independent of the calendar system.
- `weekStartsOn`, `fixedWeeks`, `weekendDays`; `dayClassName`, `dayContent` and `dayLabel` for holidays/events.
- `defaultMonth` (month shown with no selection) and a controlled `month`.
- Click-to-navigate month and year pickers, plus a `showTodayButton`.
- `presets`: quick-pick buttons ("Today", "Next 7 days", …) for single dates and ranges.
- Full keyboard support following the WAI-ARIA date picker pattern: arrows, PageUp/PageDown by month, Shift+PageUp/PageDown by year, Home/End, Enter/Escape, arrow keys in the month/year grids, and a visible focus ring. A keyboard-opened `Datepicker` focuses the grid and closes when focus leaves.
- Accessibility: localized accessible names (`labels` to override), the input is a select-only combobox, WCAG AA text contrast, and Windows high-contrast (`forced-colors`) styles. Checked with axe.
- `editable` `Datepicker`: type dates in either calendar and digit set.
- `Datepicker` form integration: `name`, `valueFormat`, `required`, `disabled`, `readOnly`, `invalid`, `clearable`, controlled `open`/`onOpenChange`, `placement`, `portal`, a forwarded `ref`.
- `className`/`style` on both components, including `--patro-*` CSS custom property overrides.
- Server rendering: `'use client'` for React Server Components, "today" read in the browser so hydration never mismatches, and a `today` prop to render it on the server.
- `patrojs/utils`: the date conversions without `'use client'`, for server code. An `exports` map, with `patrojs/style.css` for the stylesheet.
- `isValidAdDate`/`isValidBsDate`; `ad2Bs` takes a `Date`; both conversions accept Devanagari digits.
- Exported types: `CalendarProps`, `DatepickerProps`, `PatroDate`, `DateRange`, `PatroDateRange`, `PatroLabels`, `Preset`, `CalendarSystem`, `Locale`, `Numerals`.

### Fixed

- AD↔BS conversion was timezone-dependent (off by a day west of UTC) and accepted impossible dates (e.g. Feb 30).
- The BS month-length table had incorrect values for several years, found by cross-checking against independent sources.
- The calendar could show the wrong month on first render, and crashed at the edges of the supported date range (AD 1921-04-13 – 2043-04-14).
- Types resolved incorrectly under TypeScript's `node16`/`nodenext` module resolution; they're now bundled per entry, as `.d.ts` and `.d.cts`.
- Clicking the calendar's month arrows inside a `<form>` submitted it.
- The Datepicker popover stayed put when content above it moved the field, covering it; it now follows the field.

### Changed

- BS day cells mirror the AD layout: the BS day on top, the AD day underneath (it used to sit in the top-right corner).
- The popover is positioned with Floating UI (`@floating-ui/dom`) instead of Popper v2 (last released in 2023); about 1 kB smaller.
- The Datepicker field's width is the `--patro-input-width` token (288px by default).
- Rewrote the day-grid builder, hook, and utils to remove all circular imports.
- Upgraded the toolchain: Rollup 4, TypeScript 6, ESLint 9 (flat config), Jest 30, Storybook 10, Vite 8.
