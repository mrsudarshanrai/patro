# patrojs 1.0.0-beta.3 — re-test

Re-test on 12 Oct 2026 of `patrojs@1.0.0-beta.3` (npm `beta` and `latest`) against the beta.1 report (`patrojs-test-report.md`). Setup was the same as before: all seven test apps were upgraded from npm, and every original repro script was re-run (copies in `tools/b3/`, evidence in `evidence/beta3/`). Chromium 156 / Playwright 1.64, with React 18.3.1 and 19.3.0, Next.js 16.4.0 and React Router 8.4.0.

## Verdict

**Almost every reported bug is fixed.** No regressions turned up in the conversion data, keyboard grid, forms, axe or React 18/19 runs. Two problems remain before I'd call it production-ready:

1. **N1 (high):** a Datepicker with `portal` or `portalContainer` closes itself the moment it is opened from the keyboard, and focus drops to `<body>`. This existed in beta.1 and I missed it then. It now matters more, because `portalContainer` is the documented way to use the picker inside a modal.
2. **N2 (medium, introduced by the B18 fix):** on a phone, the bottom week of a two-month popover can't be reached. Scrolling down to it hides the popover.

## Status of beta.1 findings

| #      | Finding                                                                                                     | beta.3                                                                                                                                                                                                              | Evidence                                                     |
| ------ | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| B1     | Global `* { font-weight }`                                                                                  | ✅ Fixed: h1/strong/b/th stay 700; all 148 selectors scoped to `._patro`                                                                                                                                            | `t21-leak.mjs`                                               |
| B2     | Escape closes the surrounding dialog                                                                        | ✅ Fixed for native `<dialog>`, Radix and Headless UI (non-portal). With `portal`, see N1                                                                                                                           | `t09b-popover.mjs`, `t32-dialogs.mjs`                        |
| B3     | Server `Date` props shift a day                                                                             | ✅ Fixed via string props. `defaultValue='2026-10-15'` from a Server Component shows and submits 15 Oct in Los Angeles and Kathmandu with no hydration errors. A `Date` still shifts, as the SSR guide now explains | `t38-next-strings.mjs`, `evidence/beta3/next-strings-LA.png` |
| B4     | Two months overflow on phones                                                                               | ✅ Fixed: months stack at 375 px (359 px wide, no horizontal scroll); 320 px reflow passes. See N2                                                                                                                  | `t13-mobile.mjs`                                             |
| B5     | Popover off-screen in landscape                                                                             | ✅ Fixed: top stays on screen and the page scrolls to the last row                                                                                                                                                  | `t30-reach.mjs`                                              |
| B6     | `portal` unusable in modals                                                                                 | ⚠️ Partly fixed: new `portalContainer` works with the mouse in Radix, but not from the keyboard (N1)                                                                                                                | `t32-dialogs.mjs`, `t33-focus.mjs`                           |
| B7     | `--patro-input-width: 100%` shrinks the field                                                               | ✅ Fixed: fills the 600 px column, with and without a value                                                                                                                                                         | `t23b-width.mjs`                                             |
| B8     | Focus lost after a month/year pick                                                                          | ✅ Fixed: focus lands on the day grid                                                                                                                                                                               | `t08b-monthgrid.mjs`                                         |
| B9     | Kiritimati Dec 1994 invalid/crash                                                                           | ✅ Fixed: 0 errors over 44,562 days; Dec 1994 renders                                                                                                                                                               | `conv-all.mjs`, `t14-clock-tz.mjs`                           |
| B10    | react-hook-form `register()` crashes                                                                        | 📄 Documented, not changed: the Forms guide now says `register()` doesn't work and gives a `Controller` recipe, which works                                                                                         | `t17-forms.mjs`, `t17b-rhf.mjs`                              |
| B11    | Header is a `banner` landmark                                                                               | ✅ Fixed                                                                                                                                                                                                            | `t12-visual-a11y.mjs`                                        |
| B12    | `data-*` / `aria-labelledby` dropped                                                                        | ✅ Fixed; `inputClassName` and `inputMode` also work (the class goes on the visible field wrapper)                                                                                                                  | `t05-datepicker.mjs`, `t35-misc.mjs`                         |
| B13    | Year grid can't page by keyboard                                                                            | ✅ Fixed: arrows past the edge and PageUp/PageDown page                                                                                                                                                             | `t08b-monthgrid.mjs`                                         |
| B14    | Form reset ignored                                                                                          | ✅ Fixed: reset restores `defaultValue` (visible and submitted)                                                                                                                                                     | `t06b-reset.mjs`                                             |
| B15    | Host `svg`/`header`/`p` rules leak in                                                                       | ✅ Fixed: icons stay 14 px; day text unaffected                                                                                                                                                                     | `t20-styles.mjs`                                             |
| B16    | `patrojs/utils` types under node10                                                                          | ✅ Fixed (tsc and arethetypeswrong both green; publint clean)                                                                                                                                                       |                                                              |
| B17    | Invalid/unsupported values silently dropped                                                                 | ✅ Fixed: dev warnings (`patrojs: "2026-02-30" isn't a date…`, `…outside the supported range…`); an invalid `Date` opens on today's month; `ad2Bs(new Date(NaN))` → `Invalid Date.`                                 | `t28-null.mjs`, `t35-misc.mjs`                               |
| B18    | Popover floats after its field scrolls away                                                                 | ✅ Fixed, but causes N2                                                                                                                                                                                             | `t09-popover.mjs`                                            |
| B19    | Formik `handleBlur` can't mark touched                                                                      | 📄 Documented: guide uses `setFieldTouched('dob')`                                                                                                                                                                  |                                                              |
| D1     | Docs deep links 404                                                                                         | ✅ Fixed: all pages return 200                                                                                                                                                                                      |                                                              |
| Docs   | Localization captions wrong                                                                                 | ✅ Fixed: all six captions match the render; the default vs explicit `locale`/`numerals` behaviour is now spelled out                                                                                               | `t37-loc.mjs`                                                |
| Docs   | SSR `ad2Bs(new Date())` snippet, token scoping, `portal` in modals, storing dates, CHANGELOG `patro/` typos | ✅ Fixed                                                                                                                                                                                                            |                                                              |
| A11y   | No `aria-current` on today / no `lang`                                                                      | ✅ `aria-current="date"` added. ⚠️ `lang` only partly fixed (N4)                                                                                                                                                    | `t35-misc.mjs`                                               |
| Bundle | `Calendar` import kept Datepicker + Floating UI                                                             | ✅ Fixed (table below)                                                                                                                                                                                              |                                                              |

**Missing features now covered:**

- M1: string date props
- M2: `portalContainer` (but see N1)
- M6: prop pass-through
- M8: form-library recipes in the docs
- M9: form reset

M3–M5, M7 and M10–M14 are still open (BS date helpers, custom input formats, typing ranges, booking "nights", and the low-priority items).

## New findings

### N1 — Keyboard-opening a `portal` / `portalContainer` Datepicker closes it immediately

- **Severity:** high **Area:** Datepicker / accessibility
- **Repro:**
  ```tsx
  <Datepicker portal onOpenChange={(o) => console.log(o)} />
  // or, per the Forms guide: <Dialog.Content ref={setContent}><Datepicker portalContainer={content} /></Dialog.Content>
  ```
  Tab to the field, press Enter (or Space / ArrowDown).
- **Expected:** popover opens with focus on the day grid, as in non-portal mode.
- **Actual:** `onOpenChange` logs `true` then `false`. Focus moves into the grid, the popover unmounts, and focus ends on `<body>` (or on the Radix dialog content). Arrow keys and Enter then do nothing, and the next Escape closes the whole Radix dialog. Mouse use works. It happens with no dialog at all, and also in Headless UI. beta.1 behaved the same; I mistook it for focus-trap interference in the first report.
- **Evidence:** `tools/b3/t39-portal-open.mjs` (`log ["open:true","open:false"] | focus events ["out:DIV.combobox->grid","in:DIV.grid","out:DIV.grid->null"]`), `t34-portalkbd.mjs`, `t33-focus.mjs`.
- **Suspected cause:** in `package/Datepicker/hooks/usePopover.ts`, `onFocusLeave` closes the popover unless `relatedTarget` is inside `rootRef` or `popover`. In non-portal mode the grid is inside `rootRef`, so the check passes. In portal mode it relies on the `popover` state from the `setPopover` callback ref, which looks stale or `null` when the field's blur fires as the grid takes focus (`Datepicker/index.tsx:280` `autoFocus={focusGrid}`). **Unverified:** whether it is the stale state or the order of the ref callback. Checking `event.currentTarget`/the portal node via a ref (not state), or deferring the containment check by a frame, should fix it.

### N2 — On phones, the last week of a two-month popover can't be reached

- **Severity:** medium **Area:** Datepicker / mobile (side effect of the B18 fix)
- **Repro:** 375×667 touch viewport, `<Datepicker mode='range' numberOfMonths={2} />` near the top of the page, tap the field.
- **Actual:** the stacked popover is 686 px tall (y 90–776), so the second month's last row is below the screen. Scrolling the page toward it moves the field off-screen, and at that point the popover gets `visibility: hidden` (`data-detached`). Tapping 30 Nov times out. On real phones the browser toolbar leaves even less height.
- **Evidence:** `tools/b3/t31-scrollhide.mjs` (`scroll 110 … pop 8..694 visibility=hidden`), `evidence/beta3/mobile-2months-scrolled.png`.
- **Fix idea:** in `usePopover.ts`, the `size()` middleware only sets `maxWidth`. Also set `maxHeight: availableHeight` with `overflow-y: auto` on the popover, or don't detach while the popover itself is taller than the viewport.

### N3 — Range-only props now type-check in single mode

- **Severity:** low **Area:** types
- **Repro:** `<Datepicker minDays={2} />` or `<Calendar maxDays={3} excludeDisabled />` without `mode='range'`. beta.1 rejected these; beta.3 compiles them, and they have no effect. Unknown props (`foo='bar'`) and range values in single mode are still rejected.
- **Suspected cause:** the new ``[dataAttribute: `data-${string}`]`` index signature on `CalendarBaseProps` relaxes excess-property checking on the union overload.

### N4 — `lang` added, but BS day names are still mostly English

- **Severity:** low **Area:** accessibility
- The BS calendar root now has `lang="ne"`, but with default props its day names read `"3 October 2026, १७ आश्विन २०८३"`. The English half is now tagged as Nepali (the reverse of the beta.1 problem). With `locale='ne' numerals='devanagari'` the names are fully Nepali and correct. Either localise the default names, or wrap the other-calendar part in its own `lang`.

## Checked and unchanged (no regressions)

- **Conversion:** identical to beta.1 for all 44,562 days in UTC, Los Angeles and Kiritimati. Round trips never fail, and `nepali-datetime` disagrees only on 48 BS 2099 days.
- **Keyboard:** the full day-grid walkthrough matches the documented table.
- **axe:** 0 violations in all 15 states.
- **Forms:**
  - native submit, `required`, range field names and `valueFormat` all work;
  - editable input parsing and Devanagari paste work;
  - the react-hook-form `Controller` and Formik recipes work.
- **React versions:** 18 and 19 give identical results with no console warnings. Midnight rollover still works, and the Apia and São Paulo timezone edge cases render fine.
- **Docs:** the original 17 snippets still compile and render; the documented width snippet now fills the column.
- **Bundle** (Vite 8 production build, React 18 app, baseline 140.6 kB / 45.7 kB gzip):

| Import          | beta.1 (min / gzip) | beta.3 (min / gzip)  |
| --------------- | ------------------- | -------------------- |
| `Datepicker`    | +55.0 / +18.8 kB    | +60.0 / +20.6 kB     |
| `Calendar` only | +55.0 / +18.8 kB    | **+32.2 / +10.7 kB** |
| `patrojs/utils` | +7.7 / +1.8 kB      | +7.8 / +1.8 kB       |
| CSS             | 15.07 / 2.88 kB     | 15.15 / 2.90 kB      |

## Recommended next steps

1. Fix N1 (portal keyboard focus) and add a Playwright test that keyboard-opens a `portal` and a `portalContainer` picker inside a Radix dialog.
2. Fix N2 with a `maxHeight` plus internal scroll on the popover, and test two months at 375×667.
3. Tighten the single-mode types (N3) and localise the default BS day names or their `lang` (N4).
4. Then the remaining feature requests: BS date helpers, custom input formats, editable ranges, booking "nights".
