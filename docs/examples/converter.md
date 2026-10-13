# Date converter

The conversion and date-math functions on their own, with no calendar on screen. They run anywhere, including server code through `patrojs/utils`, and cover AD 1921-04-13 to 2043-04-14 (BS 1978–2099).

<div class="vp-raw example">
  <ReactIsland demo="Converter" />
</div>

## Code

```tsx
import { ad2Bs, bs2Ad, isValidBsDate, formatBsDate, addBsMonths, bsDaysBetween } from 'patrojs/utils';

ad2Bs('2026-10-21');                          // '2083-07-04'
bs2Ad('२०८३-०७-२२');                          // '2026-11-08' (Devanagari digits work)
formatBsDate('2083-07-04', { weekday: true }); // 'बुधवार, ४ कार्तिक २०८३'
addBsMonths('2083-03-32', 1);                 // '2083-04-31', clamped to Shrawan's length
bsDaysBetween('2083-07-01', '2083-12-30');    // whole days between two BS dates
isValidBsDate('2080-01-32');                  // false
```
