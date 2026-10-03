# Holidays, events & presets

## Marking days

Three props receive each day as a `PatroDate` (`{ date, ad, bs }`), so you can key your data by AD or BS date:

| Prop | Use it for |
| --- | --- |
| `dayClassName` | Styling a day, e.g. holidays in red |
| `dayContent` | Drawing something inside a day (top-left corner), e.g. event dots |
| `dayLabel` | Adding text to the day's accessible name, e.g. the holiday's name |

```tsx
const holidays: Record<string, string> = {
  '2083-07-04': 'Vijaya Dashami',
  '2083-07-22': 'Laxmi Puja',
};

<Calendar
  calendar='BS'
  weekendDays={[6]}
  dayClassName={({ bs }) => (holidays[bs] ? 'holiday' : undefined)}
  dayContent={({ bs }) => holidays[bs] && <i className='dot' />}
  dayLabel={({ bs }) => holidays[bs]}
/>;
```

`dayContent` is visual only: a screen reader reads the day's accessible name, not its content. Pair it with `dayLabel` so a marked day is announced as, say, "21 October 2026, ४ कार्तिक २०८३, Vijaya Dashami".

`weekendDays` colours whole weekdays (Nepal's weekend is `[6]`, Saturday) and `isDateDisabled` makes days unpickable; see the [props reference](../reference/props).

## Presets

`presets` adds quick-pick buttons under the grid:

```tsx
const addDays = (date: Date, days: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

<Datepicker
  label='Follow-up'
  presets={[
    { label: 'Tomorrow', value: () => addDays(new Date(), 1) },
    { label: 'In a week', value: () => addDays(new Date(), 7) },
  ]}
/>;
```

- In single mode each `value` is a `Date`; in range mode a `DateRange` ([Date ranges](./date-ranges#presets)).
- A function value is read when the button renders and when it's clicked, so relative presets like "Tomorrow" stay current.
- Picking a preset selects it and moves the view to it; in a `Datepicker` it closes the popover like a normal pick.
- A preset that breaks `minDate`/`maxDate`, disabled days or range rules is disabled.
- The preset matching the current value is marked pressed (`aria-pressed`).

The group's accessible name is "Quick picks" / "छिटो छनोट"; change it with the `presets` key of `labels`.
