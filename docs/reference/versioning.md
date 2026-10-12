# Versioning

patro follows [semantic versioning](https://semver.org) from 1.0.0: a breaking change to the public API only comes in a new major version. This page says what the public API is, and what can change in a minor or patch release.

## The public API

These only change in a major version:

- **Exports** of `patrojs` and `patrojs/utils`: components, functions and types, by name and signature.
- **Props** of `Calendar` and `Datepicker`: names, accepted values, and defaults.
- **Values you get back**: the `onChange` and `onMonthChange` payloads (`PatroDate`, `PatroDateRange`), the `'YYYY-MM-DD'` strings, and what a native form submits (`name`, `name[start]`, `name[end]`, `valueFormat`).
- **Behaviour** described in these docs: controlled and uncontrolled values, keyboard support, range rules, server rendering.
- **Theming**: the `--patro-*` tokens listed on [Theming](../guide/theming), the `._patro` and `._patro_datepicker` selectors used to set them, and the `theme` prop / `data-theme="dark"`.
- **Error types**: the helpers throw `RangeError` for invalid or unsupported dates and `TypeError` for wrong argument types.
- **Package entry points**: `patrojs`, `patrojs/utils` and `patrojs/style.css`, in ESM and CommonJS.
- **Supported React versions**: dropping one is a major change.

## What can change in a minor release

Additions, which can't break code written against the documented API:

- New props, functions, types and tokens.
- New values in union types such as `Locale`, `CalendarSystem` or `placement`, for example another language. A `switch` over every member may then need a new case.
- New keys in `PatroLabels`, for new buttons. Type your overrides as `Partial<PatroLabels>`, as the `labels` prop does.
- A wider supported date range.

## Not part of the public API

These can change in any release:

- **Wording** of accessible names, visible text, placeholders, error messages and development warnings. In tests, prefer a pattern (`{ name: /^12 October 2026/ }`) over the full text.
- **DOM structure and class names** other than `._patro` and `._patro_datepicker`. The `_patro_*` classes are internal; style through the tokens, `className`, `inputClassName`, `dayClassName` and `style` instead.
- **Default look**: colours, spacing, sizes and animations.
- **Bundle size and performance**, other than keeping unused parts tree-shakable.
- **Calendar data for far-future years.** BS months have no formula, so patro ships a lookup table. Past and near-future years match published calendars; years further ahead are projections, and other sources still disagree on some of them (parts of BS 2084–2099). When they do, patro corrects the table in a minor or patch release, and conversions for those dates change with it.

## Deprecations

A renamed prop, token or function keeps working until the next major version, and the CHANGELOG lists it under **Deprecated**. For example, the beta token names (`--patro-sub`, `--patro-faint-sub`, `--patro-sel-bg`, `--patro-sel-text`, `--patro-sel-sub`) still work through 1.x; use `--patro-secondary`, `--patro-faint-secondary`, `--patro-selected-bg`, `--patro-selected-text` and `--patro-selected-secondary` instead.
