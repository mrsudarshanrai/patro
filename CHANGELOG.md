# Changelog

## 0.1.0-beta

First real release. `0.0.1`–`0.0.4-beta` were early test publishes with no announced API; this is a ground-up rewrite and not compatible with them.

### Breaking, if you used a `0.0.x` version

- `Calendar`/`Datepicker` props renamed: `calendarType` → `calendar`, `showExtra` → `showSecondaryDate`, `defaultDate` → `value` / `defaultValue`.
- `onChange` now receives a `PatroDate` (`{ date, ad, bs }`), or `null`, instead of an internal grid-cell object.

### Added

- Date-range selection: `mode="range"` on both components.
- `minDate`, `maxDate`, `isDateDisabled` for disabling individual days or ranges.
- `locale` and `numerals` — display month/weekday names and digits in English/Nepali independent of the calendar system.
- `weekStartsOn`, `fixedWeeks`, `weekendDays`, `dayClassName` for holidays/events.
- Click-to-navigate month and year pickers, plus a `showTodayButton`.
- Full keyboard support (arrow keys, PageUp/PageDown, Enter/Escape) with a visible focus ring.
- `Datepicker` form integration: `name`, `valueFormat`, `required`, `disabled`, `readOnly`, `invalid`, `clearable`, controlled `open`/`onOpenChange`, `placement`, `portal`, a forwarded `ref`.
- `className`/`style` on both components, including `--patro-*` CSS custom property overrides.
- Exported types: `CalendarProps`, `DatepickerProps`, `PatroDate`, `DateRange`, `PatroDateRange`, `CalendarSystem`, `Locale`, `Numerals`.

### Fixed

- AD↔BS conversion was timezone-dependent (off by a day west of UTC) and accepted impossible dates (e.g. Feb 30).
- The BS month-length table had incorrect values for several years, found by cross-checking against independent sources.
- The calendar could show the wrong month on first render, and crashed at the edges of the supported date range (AD 1921-04-13 – 2043-04-14).

### Changed

- Rewrote the day-grid builder, hook, and utils to remove all circular imports.
- Upgraded the toolchain: Rollup 4, TypeScript 6, ESLint 9 (flat config), Jest 30, Storybook 10, Vite 8.
