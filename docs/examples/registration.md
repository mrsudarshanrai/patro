# Registration form

A citizenship-style form: the date of birth is typed or picked in Bikram Sambat, checked against a minimum age of 16 BS years, and handed to the server in both calendars. Built with react-hook-form's `Controller`.

<div class="vp-raw example">
  <ReactIsland demo="Registration" />
</div>

## Code

```tsx
<Controller
  name='dob'
  control={control}
  rules={{
    required: 'Enter your date of birth.',
    validate: (dob) => addBsYears(dob.bs, 16) <= getBsToday() || 'You must be at least 16.',
  }}
  render={({ field, fieldState }) => (
    <Datepicker
      ref={field.ref}
      label='जन्म मिति (वि.सं.)'
      calendar='BS'
      editable                     // type २०५७-०९-१५ or 2057/9/15
      clearable
      defaultMonth='2008-01-01'    // open years back, not on today
      maxDate={new Date()}
      value={field.value?.date ?? null}
      onChange={field.onChange}    // keeps the whole PatroDate
      onBlur={field.onBlur}
      invalid={!!fieldState.error}
      aria-describedby='dob-error'
    />
  )}
/>
```
