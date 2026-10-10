# Server rendering

patro works with server-rendered React (Next.js App Router, Remix, Astro islands, …).

## React Server Components

The main entry is marked `'use client'`, so you can import `Calendar` and `Datepicker` straight from a Server Component:

```tsx
// app/page.tsx: a Server Component
import { Datepicker } from 'patrojs';

export default function Page() {
  return <Datepicker label='Date' />;
}
```

`'use client'` also means calling the conversion functions from the main entry inside a Server Component fails: you'd get a client reference, not the function. For server code, import them from `patrojs/utils`, which isn't marked:

```tsx
import { ad2Bs } from 'patrojs/utils';

export default function Page() {
  return <p>Today is {ad2Bs(new Date())} BS</p>;
}
```

## "Today" and hydration

The server's date (often UTC) can differ from the visitor's: for 5 hours 45 minutes of every day, UTC and Nepal are on different dates. If the server rendered its own "today", hydration would mismatch.

So patro reads today **in the browser**:

- With a `value` (or `defaultValue`), the server renders that month normally.
- Without one, the server renders the calendar's frame with the month left blank (`aria-busy`), and the browser fills it in on hydration: no mismatch, no layout shift.
- A `portal` popover is only created in the browser, since there's no `document.body` on the server.

To render the month on the server too, pass `today`, e.g. a date you computed on the server for the visitor's timezone:

```tsx
<Calendar today={visitorToday} />
```

`today` is also handy for pinning dates in tests and screenshots. After hydration, "today" keeps up with the clock, moving on at midnight.
