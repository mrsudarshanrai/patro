# Forms

`Datepicker` is built to work inside a plain HTML `<form>`, not just a component-level state manager.

## Native submission

Give it a `name`, and it renders a hidden real `<input>` so the date is included in the form's `FormData` and works with native validation:

```tsx
<form>
  <Datepicker label='Date of birth' name='dob' required />
</form>
```

In range mode, `name="stay"` submits two fields: `stay[start]` and `stay[end]`.

## Typing dates

`editable` turns the field into a text input as well, for people who'd rather type a date they know than click to it:

```tsx
<Datepicker label='Date of birth' calendar='BS' editable defaultMonth={new Date(2000, 0, 1)} />
```

- Type the date in the displayed calendar: `2083-07-12`, `2083/7/12` or `2083.07.12`, in Latin or Devanagari digits.
- It's committed on Enter or when leaving the field, and shown back in the calendar's own digits.
- Text that isn't an allowed date (impossible, outside `minDate`/`maxDate`, or disabled) is marked invalid on Enter and reverts when you leave.
- Clearing the text clears the value.
- ArrowDown opens the calendar; the calendar button next to the field does too.

`editable` is for single dates; in range mode it's ignored. `formatValue` isn't used while editable, since the text has to stay typeable.

## Submitted format

By default the submitted value is the AD date (`'YYYY-MM-DD'`). Use `valueFormat='bs'` to submit the BS date instead — handy when the calendar itself is displayed in BS:

```tsx
<Datepicker calendar='BS' name='dob' valueFormat='bs' required />
```

## Validation states

- `required` blocks native form submission while the value is empty.
- `invalid` applies error styling (the `--patro-danger` token) and sets `aria-invalid`. Combine it with your own validation logic:

```tsx
const [dob, setDob] = useState<Date | null>(null);
const [submitted, setSubmitted] = useState(false);

<Datepicker
  label='Date of birth'
  required
  value={dob}
  onChange={(picked) => setDob(picked?.date ?? null)}
  invalid={submitted && !dob}
  aria-describedby='dob-help'
/>;
```

## Other form-relevant props

| Prop | Purpose |
| --- | --- |
| `disabled` | Can't be focused or opened |
| `readOnly` | Focusable, shows its value, but can't be changed |
| `id`, `aria-label`, `aria-describedby` | Passed straight to the input for label/description wiring |
| `onFocus` / `onBlur` | For "touched" tracking with form libraries |
| `ref` | Forwarded to the focusable field (the text input when `editable`), e.g. for a form library's focus-on-error |

## Form libraries

`onChange` receives a `PatroDate`, not a DOM event, so a form library's `register()` spread doesn't work. Connect it as a controlled field instead.

**react-hook-form**, with `Controller`:

```tsx
<Controller
  name='dob'
  control={control}
  rules={{ required: true }}
  render={({ field, fieldState }) => (
    <Datepicker
      ref={field.ref}
      value={field.value}
      onChange={(picked) => field.onChange(picked?.date ?? null)}
      onBlur={field.onBlur}
      invalid={!!fieldState.error}
    />
  )}
/>
```

**Formik**: set the value and the touched state by name, since the blur event's target isn't a named input:

```tsx
<Datepicker
  value={formik.values.dob}
  onChange={(picked) => formik.setFieldValue('dob', picked?.date ?? null)}
  onBlur={() => formik.setFieldTouched('dob')}
  invalid={!!(formik.touched.dob && formik.errors.dob)}
/>
```

## Storing dates

`PatroDate.date` is local midnight of the picked day. `JSON.stringify` and `toISOString()` turn it into a UTC instant, which reads as the previous day for anyone east of UTC: in Nepal, 15 Oct becomes `2026-10-14T18:15:00.000Z`. To store or send a date, use the `ad` (or `bs`) string, the same `'YYYY-MM-DD'` value a native form submits.

## Inside dialogs

Escape closes only the popover, so a surrounding dialog stays open. Leave `portal` off inside a modal dialog: a modal keeps focus and clicks inside itself, so a popover rendered in `document.body` can't be used.

## Layout

The field is 288px wide by default. To fill a form column, set the `--patro-input-width` token:

```css
.my-form ._patro_datepicker {
  --patro-input-width: 100%;
}
```

See the **Templates → Forms** section in Storybook for three complete, working examples: a citizenship-style registration form (BS, required, a typeable date of birth), a hotel booking form (two months, 2–14 nights around booked dates, a live price summary), and a fully Nepali leave-application form.
