# बिदा निवेदन

A leave application entirely in Nepali: month names, digits, buttons and screen-reader names. Saturdays and public holidays inside the range don't count against the 12-day balance, worked out with the BS date helpers, and the form submits BS dates.

<div class="vp-raw example" lang="ne">
  <ReactIsland demo="Leave" />
</div>

::: info
Public holidays are from nepalipatro.com.np for BS 2083. Check the official notice before relying on them.
:::

## Code

```tsx
import { Datepicker, addBsDays, bsDaysBetween, getBsWeekday } from 'patrojs';

<Datepicker
  mode='range'
  calendar='BS'
  locale='ne'
  numerals='devanagari'
  name='leave'
  valueFormat='bs'             // submits leave[start]=2083-07-01
  weekendDays={[6]}
  required
  clearable
  onChange={setRange}
/>

// Working days between two BS dates, skipping Saturdays and holidays
for (let i = 0; i <= bsDaysBetween(start, end); i++) {
  const day = addBsDays(start, i);
  if (getBsWeekday(day) !== 6 && !holidays[day]) working++;
}
```
