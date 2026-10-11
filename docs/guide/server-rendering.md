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

export default async function Page() {
  const event = await getEvent();
  return <p>Held on {ad2Bs(event.date)} BS</p>; // event.date: '2026-10-29'
}
```

Convert dates you already have, like stored ones. `ad2Bs(new Date())` on the server gives the server's today, which isn't the visitor's (see below).

## "Today" and hydration

The server's date (often UTC) can differ from the visitor's: for 5 hours 45 minutes of every day, UTC and Nepal are on different dates. If the server rendered its own "today", hydration would mismatch.

So patro reads today **in the browser**:

- With a `value` (or `defaultValue`), the server renders that month normally.
- Without one, the server renders the calendar's frame with the month left blank (`aria-busy`), and the browser fills it in on hydration: no mismatch, no layout shift.
- A `portal` popover is only created in the browser, since there's no `document.body` on the server.

## Passing dates from a Server Component

A `Date` crosses from a Server Component to the browser as a UTC instant, and the browser reads it back in its own timezone. For a visitor west of the server that's the previous day: the field shows and submits 14 Oct instead of 15 Oct, and hydration mismatches.

So pass dates across as `'YYYY-MM-DD'` strings and build the `Date` in a Client Component:

```tsx
'use client';
import { Datepicker } from 'patrojs';

const toLocalDate = (ad: string) => {
  const [year, month, day] = ad.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export function DobField({ dob }: { dob: string | null }) {
  return <Datepicker name='dob' defaultValue={dob ? toLocalDate(dob) : null} />;
}
```

The same goes for `value`, `minDate`, `maxDate`, `defaultMonth` and `today`. To render the month on the server too, pass `today` this way, e.g. the visitor's date worked out from a timezone cookie.

`today` is also handy for pinning dates in tests and screenshots. After hydration, "today" keeps up with the clock, moving on at midnight.
