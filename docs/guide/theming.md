# Theming

Colors, radii, and fonts are CSS custom properties scoped to `._patro` — never the global `:root` — so they can never leak into your app's own styles.

## Dark mode

Dark is an explicit opt-in, not automatic (it does **not** follow `prefers-color-scheme`, since a host app's own theme choice should win). Turn it on with the `theme` prop, or by setting the attribute yourself on the component or any ancestor:

```tsx
<Calendar theme='dark' />
```

```css
/* equivalent, e.g. if your app's own theme system sets this on <html> */
[data-theme='dark'] { }
```

## Overriding individual tokens

Any token can be overridden per instance via `style`, or globally via your own CSS targeting `._patro`. Set tokens on `._patro` itself: the component defines every token there, so a value set on `:root` or another ancestor never reaches it.

```tsx
<Calendar style={{ '--patro-accent': 'teal' } as React.CSSProperties} />
```

```css
/* globally, for every patro instance in your app */
._patro {
  --patro-accent: teal;
  --patro-radius-cell: 4px;
}
```

## All tokens

| Token | Purpose |
| --- | --- |
| `--patro-surface` | Popover / input background |
| `--patro-text` | Primary text |
| `--patro-muted` | Weekday header, labels, placeholder |
| `--patro-sub` | Secondary (other-calendar) number |
| `--patro-faint` / `--patro-faint-sub` | Other months' days |
| `--patro-disabled` | Days and buttons you can't pick |
| `--patro-hover` | Cell / button hover background |
| `--patro-border` / `--patro-border-hover` | Input ring |
| `--patro-accent` | Selection ring, focus ring, links |
| `--patro-today` | Today's number when not selected |
| `--patro-weekend` | `weekendDays` text color |
| `--patro-danger` | `invalid` state on `Datepicker` |
| `--patro-sel-bg` / `--patro-sel-text` / `--patro-sel-sub` | Selected day |
| `--patro-range-bg` | Range-mode band between start and end |
| `--patro-halo` | Input focus ring (outer glow) |
| `--patro-glow` | Selected-cell glow (mainly visible in dark mode) |
| `--patro-shadow` | Popover shadow |
| `--patro-radius-popover` / `--patro-radius-cell` / `--patro-radius-input` | Corner radii |
| `--patro-input-width` | Datepicker field width (288px); `100%` fills a form column |
| `--patro-font` | Latin font stack |
| `--patro-font-devanagari` | Devanagari font stack |

## Field width

The Datepicker field is `--patro-input-width` wide, 288px by default. In a form layout, fill the column:

```css
.my-form ._patro_datepicker {
  --patro-input-width: 100%;
}
```

## Contrast and high-contrast mode

The default text tokens meet WCAG AA (4.5:1) against `--patro-surface` in both themes; `--patro-disabled` is deliberately fainter, since disabled days are exempt. If you override colours, keep that ratio for anything people need to read.

In Windows high-contrast mode (`forced-colors`), the selected day, range band, today marker, focus rings, field borders and invalid state are redrawn with system colours, so they stay visible whatever the user's palette.

## Devanagari font

For pixel-exact Devanagari numerals, load [Noto Sans Devanagari](https://fonts.google.com/noto/specimen/Noto+Sans+Devanagari) yourself — patro doesn't bundle or auto-inject it (a library forcing a network request or fighting your CSP is an anti-pattern). It falls back to your system sans-serif otherwise.

## className / style

Both components also accept a plain `className` and `style` on their root element, for anything a CSS custom property can't cover.
