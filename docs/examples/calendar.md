# Festival calendar

A Bikram Sambat month with this season's festivals marked the way a printed patro does, in red. Every day also carries its AD date, and the list beside it follows the month you are on.

<div class="vp-raw example">
  <ReactIsland demo="FestivalCalendar" />
</div>

::: info
Festival dates are from nepalipatro.com.np for BS 2083 Ashwin–Poush. Check the official notice before relying on them.
:::

## Code

```tsx
import { Calendar, formatBsDate } from 'patrojs';
import { holidays } from './holidays'; // { '2083-07-04': { ne: 'विजया दशमी', ... } }

<Calendar
  calendar='BS'
  weekendDays={[6]}            // Saturday, Nepal's weekly holiday
  showTodayButton
  dayClassName={({ bs }) => (holidays[bs]?.publicHoliday ? 'is-holiday' : undefined)}
  dayContent={({ bs }) => holidays[bs] && <i className='festival-dot' />}
  dayLabel={({ bs }) => holidays[bs]?.ne}   // read out by screen readers
  onMonthChange={({ start, end }) => setMonth({ start: start.bs, end: end.bs })}
  onChange={setPicked}
/>
```
