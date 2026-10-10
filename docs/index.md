---
layout: home

hero:
  name: patro
  text: AD and BS dates for React
  tagline: A calendar and datepicker for Gregorian and Bikram Sambat dates, side by side. Accessible, ready for real forms and server rendering, with AD ↔ BS conversion built in.
  actions:
    - theme: brand
      text: Get started
      link: /guide/getting-started
    - theme: alt
      text: Try it
      link: '#try-it'
    - theme: alt
      text: GitHub
      link: https://github.com/mrsudarshanrai/patro

features:
  - icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>'
    title: Two calendars, any language
    details: Show BS or AD, with names in English or Nepali and Latin or Devanagari digits, chosen independently.
  - icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h18M7 8l-4 4 4 4M17 8l4 4-4 4"/></svg>'
    title: Dates or ranges
    details: Single days or start–end ranges, with length limits, booked-day exclusion, presets and two months side by side.
  - icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>'
    title: Built for real forms
    details: Type or pick dates, submit them with native forms in AD or BS, and validate with required and invalid states.
  - icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4" r="2"/><path d="M5 8l7 1 7-1M12 9v5M9 21l3-7 3 7"/></svg>'
    title: Accessible by default
    details: The WAI-ARIA date picker keyboard pattern, screen-reader names in English or Nepali, AA contrast, high-contrast mode.
  - icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="8" rx="2"/><rect x="2" y="13" width="20" height="8" rx="2"/><path d="M6 7h.01M6 17h.01"/></svg>'
    title: Server-rendering safe
    details: Works in Next.js and Remix with no hydration mismatches. The date utilities run on the server too.
  - icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r="1"/><circle cx="17.5" cy="10.5" r="1"/><circle cx="8.5" cy="7.5" r="1"/><circle cx="6.5" cy="12.5" r="1"/><path d="M12 2a10 10 0 0 0 0 20c.9 0 1.6-.7 1.6-1.7 0-.4-.2-.8-.4-1.1-.3-.3-.4-.7-.4-1.1 0-.9.7-1.6 1.6-1.6H16a6 6 0 0 0 6-6c0-4.9-4.5-8.5-10-8.5z"/></svg>'
    title: Yours to theme
    details: Every colour, radius and size is a CSS token, with opt-in dark mode. Real BS data from 1978 to 2099.
---

<div class="home-quickstart">

<p class="home-eyebrow">Quick start</p>

## Up and running in a minute

<div class="home-steps">
<div>

### <span class="step">1</span>Install

```bash
npm i patrojs@beta
```

</div>
<div>

### <span class="step">2</span>Add the styles

```js
import 'patrojs/style.css';
```

</div>
<div>

### <span class="step">3</span>Pick a date

```tsx
import { Datepicker } from 'patrojs';

<Datepicker calendar='BS' />
```

</div>
</div>

<div class="home-cta">
  <a class="primary" href="./guide/getting-started">Read the guide</a>
  <a href="./reference/props">Props reference</a>
</div>

</div>
