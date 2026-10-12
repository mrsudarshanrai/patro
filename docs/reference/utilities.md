# AD ↔ BS utilities

The conversion functions the components use internally are also exported, if you just need date math without any UI:

```ts
import { ad2Bs, bs2Ad, isValidAdDate, isValidBsDate } from 'patrojs';

ad2Bs('2022-10-24'); // '2079-07-07'
ad2Bs(new Date(2022, 9, 24)); // '2079-07-07' (read in local time)
bs2Ad('2079-07-07'); // '2022-10-24'
bs2Ad('२०७९-०७-०७'); // '2022-10-24'

isValidAdDate('2026-02-29'); // false
isValidBsDate('2080-01-32'); // false
```

## BS date helpers

Date math and display in Bikram Sambat, without converting back and forth yourself:

```ts
import {
  getBsToday,
  daysInBsMonth,
  getBsWeekday,
  addBsDays,
  addBsMonths,
  addBsYears,
  bsDaysBetween,
  formatBsDate,
} from 'patrojs';

getBsToday(); // '2083-07-12' (this device's clock)
daysInBsMonth(2083, 3); // 32 (Asar)
getBsWeekday('2083-07-12'); // 4 (0 = Sunday … 6 = Saturday)

addBsDays('2083-07-12', -12); // '2083-06-31'
addBsMonths('2083-03-32', 1); // '2083-04-31' (clamped: Shrawan has 31 days)
addBsYears('2067-06-25', 16) <= getBsToday(); // true: born 2067-06-25, now 16 or older
bsDaysBetween('2083-07-01', '2083-07-12'); // 11

formatBsDate('2083-06-25'); // '२५ आश्विन २०८३'
formatBsDate('2083-06-25', { weekday: true }); // 'आइतवार, २५ आश्विन २०८३'
formatBsDate('2083-06-25', { locale: 'en' }); // '25 Asoj 2083'
```

They take BS dates in Latin or Devanagari digits, return Latin `'YYYY-MM-DD'` strings, and throw a `RangeError` for invalid dates or results outside the supported range. `formatBsDate` defaults to Nepali names and Devanagari digits; set `locale: 'en'` for English, and `numerals` to choose the digits separately. All of them are in `patrojs/utils` too.

## Input and errors

- Dates are `'YYYY-MM-DD'` strings, in Latin or Devanagari digits. `ad2Bs` also takes a `Date`, read in local time.
- Results are always `'YYYY-MM-DD'` in Latin digits.
- `ad2Bs`/`bs2Ad` throw a `RangeError` for a malformed date (`'2022-1-5'`, `'2022/10/24'`), an impossible one (`'2026-02-30'`) or one outside the supported range, and a `TypeError` for a non-string.
- `isValidAdDate`/`isValidBsDate` never throw; they return a boolean, e.g. for form validation.

## On the server

The main `patrojs` entry is marked `'use client'` for its components. In React Server Components or other server code, import the same functions from `patrojs/utils`, which isn't:

```ts
import { ad2Bs, bs2Ad, formatBsDate } from 'patrojs/utils';
```

## Supported range

AD `1921-04-13` through `2043-04-14`, which is BS `1978-01-01` through `2099-12-31`.

This isn't a formula-based conversion: Bikram Sambat month lengths are set year by year, so patro ships a lookup table. Its 2000–2098 values match the `nepali-datetime` package and were cross-checked against published calendars; far-future years are projections, and sources disagree on some of them.

There's an interactive version in Storybook under **Utilities → Date converter**.
