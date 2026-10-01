# Getting started

## Install

```bash
npm install patro@beta
```

Requires React 18 or 19. This is a beta: `npm install patro` without `@beta` still gets an old 2023 test build until 1.0 is released.

Import the stylesheet once, wherever your app already loads global CSS:

```js
import 'patro/style.css';
```

## Calendar

```tsx
import { Calendar } from 'patro';

function App() {
  return <Calendar calendar='BS' onChange={(value) => console.log(value?.ad, value?.bs)} />;
}
```

## Datepicker

```tsx
import { Datepicker } from 'patro';

function App() {
  return <Datepicker label='Date' onChange={(value) => console.log(value?.ad)} />;
}
```

`Datepicker` renders a field that opens `Calendar` in a popover; picking a day closes it and fills the field. Add `editable` to let people type the date as well.

Both start with **nothing selected**, showing the current month. Pass `defaultValue={new Date()}` to start on today.

## `onChange` payload

`onChange` receives a `PatroDate`: the picked day in both calendar systems, plus a real `Date`:

```ts
{
  date: Date;
  ad: '2026-10-29';
  bs: '2083-07-12';
}
```

(In range mode it's `{ start: PatroDate | null; end: PatroDate | null }` instead; see [Date ranges](./date-ranges).)

## Next

- [Controlled vs uncontrolled](./controlled-uncontrolled): how the value and the displayed month are managed
- [Forms](./forms): native submission, validation, typing dates
- [Server rendering](./server-rendering): Next.js, Remix
- [Props reference](../reference/props): every prop, in one table
