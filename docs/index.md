---
layout: home

hero:
  name: patro
  text: AD ⇄ BS calendar and datepicker for React
  tagline: A Calendar and Datepicker for the Nepali Bikram Sambat calendar, with built-in AD ↔ BS date conversion utilities.
  actions:
    - theme: brand
      text: Get started
      link: /guide/getting-started
    - theme: alt
      text: Props reference
      link: /reference/props
    - theme: alt
      text: View on GitHub
      link: https://github.com/mrsudarshanrai/patro

features:
  - title: Two calendar systems
    details: Display AD (Gregorian) or BS (Bikram Sambat), independent of the language and digits used for names and numbers.
  - title: Single dates or ranges
    details: mode="range" with hover and keyboard preview, length limits, booked-day exclusion, presets, and two months side by side.
  - title: Built for real forms
    details: Type or pick dates in either calendar, native submission and validation, required/disabled/invalid states, and a forwarded ref.
  - title: Accessible
    details: The WAI-ARIA date picker keyboard pattern, screen-reader names in English or Nepali, WCAG AA colours, and Windows high-contrast support.
  - title: Server-rendering safe
    details: Works in Next.js and Remix with no hydration mismatches; the date utilities run on the server via patro/utils.
  - title: Themeable, real data
    details: Every colour, radius and size is a CSS token, with opt-in dark mode. BS conversion is table-driven, AD 1921–2043 (BS 1978–2099).
---
